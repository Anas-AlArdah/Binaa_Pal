const { Op } = require('sequelize');
const {
  Request,
  Review,
  Role,
  Skill,
  User,
  WorkerProfile,
  Worker_Skill,
} = require('../models');
const {
  buildCraftPayload,
  getCraftSlugBase,
  getCraftValidationError,
} = require('../utils/craftMetadata');

const COMPLETED_STATUSES = ['completed', 'done', 'closed', '\u0645\u0643\u062a\u0645\u0644'];
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function toPositiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function getPagination(query) {
  const page = toPositiveInteger(query.page, 1);
  const requestedLimit = toPositiveInteger(query.limit, DEFAULT_PAGE_SIZE);
  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
  const offset = (page - 1) * limit;

  return { limit, offset, page };
}

function buildPagination(count, page, limit) {
  return {
    total: count,
    page,
    limit,
    pages: Math.ceil(count / limit) || 1,
  };
}

function buildSearchWhere(search, fields) {
  const cleanSearch = String(search || '').trim();

  if (!cleanSearch) {
    return {};
  }

  return {
    [Op.or]: fields.map((field) => ({
      [field]: {
        [Op.iLike]: `%${cleanSearch}%`,
      },
    })),
  };
}

function formatCraftItem(skill, workersCount = 0) {
  return {
    id: skill.id,
    name: skill.skill_name,
    skill_name: skill.skill_name,
    slug: skill.slug,
    description: skill.description,
    iconKey: skill.icon_key,
    icon_key: skill.icon_key,
    createdAt: skill.createdAt,
    workersCount,
  };
}

async function createUniqueCraftSlug(payload, excludeId = null) {
  const base = getCraftSlugBase(payload);
  let slug = base;
  let suffix = 2;

  while (await Skill.findOne({
    where: {
      slug,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function formatUserName(user) {
  if (!user) {
    return 'Not specified';
  }

  return [user.firstname, user.lastname].filter(Boolean).join(' ') || user.email || 'Not specified';
}

function sanitizeUser(user) {
  const plainUser = typeof user?.get === 'function' ? user.get({ plain: true }) : user;

  return {
    id: plainUser.id,
    firstname: plainUser.firstname,
    lastname: plainUser.lastname,
    name: formatUserName(plainUser),
    email: plainUser.email,
    phone: plainUser.phone,
    location: plainUser.location,
    role: plainUser.role?.type || null,
    role_id: plainUser.role_id,
    createdAt: plainUser.createdAt,
  };
}

function sanitizeAdminRequest(requestModel) {
  const request = toPlain(requestModel) || {};

  return {
    id: request.id,
    description: request.description || '',
    city: request.city || '',
    date: request.date,
    status: request.status || 'pending',
    craftName: request.craft_name || '',
    clientName: request.client_name || '',
    clientEmail: request.client_email || '',
    clientPhone: request.client_phone || '',
    workerId: request.worker_id || null,
    workerProfileId: request.worker_profile_id || null,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    customer: request.user ? sanitizeUser(request.user) : null,
    worker: request.worker ? sanitizeUser(request.worker) : null,
  };
}

function calculateAverageRating(reviews = []) {
  const ratings = reviews.map((review) => Number(review.rating)).filter((rating) => Number.isFinite(rating));

  if (!ratings.length) {
    return null;
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return Number((total / ratings.length).toFixed(1));
}

function toPlain(model) {
  return model && typeof model.get === 'function' ? model.get({ plain: true }) : model;
}

function uniqueNumbers(values) {
  return [...new Set(values.map((value) => Number(value)).filter((value) => Number.isFinite(value)))];
}

async function getSkillNamesByProfileId(workerProfiles) {
  const profiles = workerProfiles.map(toPlain).filter(Boolean);
  const userIds = uniqueNumbers(profiles.map((profile) => profile.user_id));
  const profileIds = uniqueNumbers(profiles.map((profile) => profile.id));
  const lookupIds = uniqueNumbers([...userIds, ...profileIds]);

  if (lookupIds.length === 0) {
    return new Map();
  }

  const skillLinks = await Worker_Skill.findAll({
    where: { worker_id: { [Op.in]: lookupIds } },
    include: [
      {
        model: Skill,
        as: 'skill',
        attributes: ['id', 'skill_name'],
      },
    ],
  }).catch(() => []);
  const skillNamesByWorkerId = new Map();

  skillLinks.map(toPlain).forEach((link) => {
    const workerId = Number(link.worker_id);
    const skillName = link.skill?.skill_name;

    if (!Number.isFinite(workerId) || !skillName) {
      return;
    }

    if (!skillNamesByWorkerId.has(workerId)) {
      skillNamesByWorkerId.set(workerId, []);
    }

    skillNamesByWorkerId.get(workerId).push(skillName);
  });

  return new Map(
    profiles.map((profile) => {
      const userId = Number(profile.user_id);
      const profileId = Number(profile.id);
      const userSkillNames = skillNamesByWorkerId.get(userId) || [];
      const fallbackProfileSkillNames =
        userSkillNames.length === 0 && !userIds.includes(profileId)
          ? skillNamesByWorkerId.get(profileId) || []
          : [];
      const skillNames = [...new Set([...userSkillNames, ...fallbackProfileSkillNames])];

      return [profileId, skillNames];
    })
  );
}

function formatWorkerService(worker, skillNamesByProfileId) {
  const skillNames = skillNamesByProfileId.get(Number(worker.id)) || [];

  return skillNames.length > 0 ? skillNames.join('، ') : worker.major || 'Not specified';
}

async function countSafely(model, options = {}) {
  try {
    return await model.count(options);
  } catch (error) {
    return 0;
  }
}

async function loadStats() {
  const [
    usersCount,
    workersCount,
    requestsCount,
    skillsCount,
    reviewsCount,
    openRequestsCount,
    completedRequestsCount,
  ] = await Promise.all([
    countSafely(User),
    countSafely(WorkerProfile),
    countSafely(Request),
    countSafely(Skill),
    countSafely(Review),
    countSafely(Request, {
      where: {
        [Op.or]: [
          { status: { [Op.notIn]: COMPLETED_STATUSES } },
          { status: null },
        ],
      },
    }),
    countSafely(Request, {
      where: {
        status: {
          [Op.in]: COMPLETED_STATUSES,
        },
      },
    }),
  ]);

  return {
    users: usersCount,
    workers: workersCount,
    requests: requestsCount,
    crafts: skillsCount,
    reviews: reviewsCount,
    openRequests: openRequestsCount,
    completedRequests: completedRequestsCount,
  };
}

async function getDashboard(req, res) {
  try {
    const [stats, recentRequests, recentWorkers] = await Promise.all([
      loadStats(),
      Request.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'description', 'city', 'date', 'status', 'createdAt'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstname', 'lastname', 'email'],
            required: false,
          },
        ],
      }).catch(() => []),
      WorkerProfile.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'user_id', 'major', 'bio', 'min_price', 'max_price', 'createdAt'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstname', 'lastname', 'email', 'location'],
            required: false,
          },
          {
            model: Review,
            as: 'reviews',
            attributes: ['rating'],
            required: false,
          },
        ],
      }).catch(() => []),
    ]);

    const recentWorkerSkillsByProfileId = await getSkillNamesByProfileId(recentWorkers);

    res.status(200).json({
      stats,
      recentRequests: recentRequests.map((request) => ({
        id: request.id,
        customer: formatUserName(request.user),
        service: request.description || 'Service request',
        city: request.city || 'Not specified',
        status: request.status || 'New',
        date: request.date || request.createdAt,
      })),
      recentWorkers: recentWorkers.map((worker) => ({
        id: worker.id,
        name: formatUserName(worker.user),
        service: formatWorkerService(worker, recentWorkerSkillsByProfileId),
        city: worker.user?.location || 'Not specified',
        priceRange:
          worker.min_price && worker.max_price
            ? `${worker.min_price} - ${worker.max_price}`
            : 'Not specified',
        rating: calculateAverageRating(worker.reviews),
      })),
      platform: {
        apiStatus: 'Connected',
        databaseStatus: 'Connected',
        adminEmail: req.admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load admin dashboard.',
      error: error.message,
    });
  }
}

async function getUsers(req, res) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const where = buildSearchWhere(req.query.search, ['firstname', 'lastname', 'email', 'phone', 'location']);

    const { rows, count } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'location', 'role_id', 'createdAt'],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'type'],
          required: false,
        },
      ],
    });

    res.status(200).json({
      items: rows.map(sanitizeUser),
      pagination: buildPagination(count, page, limit),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load admin users.',
      error: error.message,
    });
  }
}

async function getRequests(req, res) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const where = {
      ...buildSearchWhere(req.query.search, ['description', 'city', 'status']),
    };

    if (req.query.status) {
      where.status = req.query.status;
    }

    const { rows, count } = await Request.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'description',
        'city',
        'date',
        'status',
        'user_id',
        'worker_id',
        'worker_profile_id',
        'craft_name',
        'client_name',
        'client_email',
        'client_phone',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'location'],
          required: false,
        },
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'location'],
          required: false,
        },
      ],
    });

    res.status(200).json({
      items: rows.map(sanitizeAdminRequest),
      pagination: buildPagination(count, page, limit),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load admin requests.',
      error: error.message,
    });
  }
}

async function updateRequestStatus(req, res) {
  const requestId = Number(req.params.id);
  const nextStatus = cleanString(req.body.status);
  const allowedStatuses = new Set(['pending', 'in_progress', 'completed', 'cancelled']);

  if (!Number.isFinite(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'Invalid request id.' });
  }

  if (!allowedStatuses.has(nextStatus)) {
    return res.status(400).json({ message: 'Invalid request status.' });
  }

  try {
    const request = await Request.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    await request.update({ status: nextStatus });

    const updatedRequest = await Request.findByPk(requestId, {
      attributes: [
        'id',
        'description',
        'city',
        'date',
        'status',
        'user_id',
        'worker_id',
        'worker_profile_id',
        'craft_name',
        'client_name',
        'client_email',
        'client_phone',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'location'],
          required: false,
        },
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'location'],
          required: false,
        },
      ],
    });

    return res.status(200).json({ item: sanitizeAdminRequest(updatedRequest) });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update admin request status.',
      error: error.message,
    });
  }
}

async function getWorkers(req, res) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const where = buildSearchWhere(req.query.search, ['major', 'bio']);

    const { rows, count } = await WorkerProfile.findAndCountAll({
      where,
      distinct: true,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'user_id', 'bio', 'major', 'min_price', 'max_price', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'location'],
          required: false,
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating', 'comment', 'date'],
          required: false,
        },
      ],
    });

    const workerSkillsByProfileId = await getSkillNamesByProfileId(rows);

    res.status(200).json({
      items: rows.map((worker) => ({
        id: worker.id,
        user_id: worker.user_id,
        name: formatUserName(worker.user),
        email: worker.user?.email || null,
        phone: worker.user?.phone || null,
        city: worker.user?.location || null,
        major: worker.major,
        skill_names: workerSkillsByProfileId.get(Number(worker.id)) || [],
        bio: worker.bio,
        min_price: worker.min_price,
        max_price: worker.max_price,
        reviewsCount: worker.reviews?.length || 0,
        rating: calculateAverageRating(worker.reviews),
        createdAt: worker.createdAt,
      })),
      pagination: buildPagination(count, page, limit),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load admin workers.',
      error: error.message,
    });
  }
}

async function getCrafts(req, res) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const where = buildSearchWhere(req.query.search, ['skill_name']);

    const { rows, count } = await Skill.findAndCountAll({
      where,
      limit,
      offset,
      order: [['skill_name', 'ASC']],
      attributes: ['id', 'skill_name', 'slug', 'description', 'icon_key', 'createdAt'],
    });

    const items = await Promise.all(
      rows.map(async (skill) => (
        formatCraftItem(skill, await countSafely(Worker_Skill, {
          where: {
            skill_id: skill.id,
          },
        }))
      ))
    );

    res.status(200).json({
      items,
      pagination: buildPagination(count, page, limit),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load admin crafts.',
      error: error.message,
    });
  }
}

async function createCraft(req, res) {
  try {
    const payload = buildCraftPayload(req.body);
    const validationError = getCraftValidationError(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    payload.slug = await createUniqueCraftSlug(payload);

    const existingSkill = await Skill.findOne({
      where: {
        skill_name: { [Op.iLike]: payload.skill_name },
      },
    });

    if (existingSkill) {
      return res.status(409).json({ message: 'اسم الصنعة مستخدم مسبقاً.' });
    }

    const skill = await Skill.create(payload);

    res.status(201).json({
      item: formatCraftItem(skill, 0),
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'اسم الصنعة مستخدم مسبقاً.' });
    }

    res.status(500).json({
      message: 'Failed to create admin craft.',
      error: error.message,
    });
  }
}

async function updateCraft(req, res) {
  const craftId = Number(req.params.id);
  const payload = buildCraftPayload(req.body);
  const validationError = getCraftValidationError(payload);

  if (!Number.isFinite(craftId) || craftId <= 0) {
    return res.status(400).json({ message: 'Invalid craft id.' });
  }

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const skill = await Skill.findByPk(craftId);

    if (!skill) {
      return res.status(404).json({ message: 'Craft not found.' });
    }

    payload.slug = skill.slug || await createUniqueCraftSlug(payload, craftId);

    const existingSkill = await Skill.findOne({
      where: {
        id: { [Op.ne]: craftId },
        skill_name: { [Op.iLike]: payload.skill_name },
      },
    });

    if (existingSkill) {
      return res.status(409).json({ message: 'اسم الصنعة مستخدم مسبقاً.' });
    }

    await skill.update(payload);

    const workersCount = await countSafely(Worker_Skill, {
      where: {
        skill_id: skill.id,
      },
    });

    return res.status(200).json({
      item: formatCraftItem(skill, workersCount),
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'اسم الصنعة مستخدم مسبقاً.' });
    }

    return res.status(500).json({
      message: 'Failed to update admin craft.',
      error: error.message,
    });
  }
}

async function deleteCraft(req, res) {
  const craftId = Number(req.params.id);

  if (!Number.isFinite(craftId) || craftId <= 0) {
    return res.status(400).json({ message: 'Invalid craft id.' });
  }

  const transaction = await Skill.sequelize.transaction();

  try {
    const skill = await Skill.findByPk(craftId, { transaction });

    if (!skill) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Craft not found.' });
    }

    const removedWorkerLinks = await Worker_Skill.destroy({
      where: { skill_id: skill.id },
      transaction,
    });

    await skill.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({
      message: 'Craft deleted successfully.',
      deletedId: craftId,
      removedWorkerLinks,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    res.status(500).json({
      message: 'Failed to delete admin craft.',
      error: error.message,
    });
  }
}

module.exports = {
  createCraft,
  deleteCraft,
  getCrafts,
  getDashboard,
  getRequests,
  getUsers,
  getWorkers,
  updateCraft,
  updateRequestStatus,
};
