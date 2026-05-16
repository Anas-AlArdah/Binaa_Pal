const { WorkerProfile, User, Review, Worker_Skill, Skill, Availability, sequelize } = require('../models');
const {
  getProfileImage,
  normalizePortfolioItems,
  serializePortfolioItems,
} = require('../utils/workerProfileData');

const USER_ATTRIBUTES = ['id', 'firstname', 'lastname', 'email', 'phone', 'location'];

function toPlain(value) {
  return value && typeof value.get === 'function' ? value.get({ plain: true }) : value;
}

function normalizeOptionalString(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

function normalizePrice(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    const error = new Error(`Invalid value for ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }

  return numericValue;
}

function normalizeSkillIds(skillIds) {
  if (skillIds === undefined) {
    return undefined;
  }

  if (!Array.isArray(skillIds)) {
    const error = new Error('skill_ids must be an array');
    error.statusCode = 400;
    throw error;
  }

  return [...new Set(
    skillIds
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
  )];
}

function formatWorkerProfile(profileModel) {
  const profile = toPlain(profileModel);
  const workerSkills = Array.isArray(profile.worker_skills) ? profile.worker_skills : [];
  const skill_ids = workerSkills
    .map((link) => Number(link.skill?.id || link.skill_id))
    .filter((value) => Number.isInteger(value));
  const skill_names = workerSkills
    .map((link) => link.skill?.skill_name)
    .filter(Boolean);
  const portfolio_items = normalizePortfolioItems(profile.p_images);

  return {
    ...profile,
    profile_image: getProfileImage(profile),
    portfolio_items,
    skill_ids: [...new Set(skill_ids)],
    skill_names: [...new Set(skill_names)],
    availability: Array.isArray(profile.user?.availability) ? profile.user.availability : [],
  };
}

function buildProfileInclude() {
  return [
    {
      model: User,
      as: 'user',
      attributes: USER_ATTRIBUTES,
      include: [
        {
          model: Availability,
          as: 'availability',
          required: false,
        },
      ],
    },
    {
      model: Review,
      as: 'reviews',
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['firstname', 'lastname', 'location'],
        },
      ],
    },
    {
      model: Worker_Skill,
      as: 'worker_skills',
      required: false,
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'skill_name'],
        },
      ],
    },
  ];
}

async function loadProfileById(id) {
  return WorkerProfile.findByPk(id, {
    include: buildProfileInclude(),
  });
}

async function loadProfileByUserId(userId) {
  return WorkerProfile.findOne({
    where: { user_id: userId },
    include: buildProfileInclude(),
  });
}

async function syncWorkerSkills(userId, skillIds, transaction) {
  const validSkillIds = normalizeSkillIds(skillIds);

  if (validSkillIds === undefined) {
    return;
  }

  if (validSkillIds.length === 0) {
    await Worker_Skill.destroy({
      where: { worker_id: userId },
      transaction,
    });
    return;
  }

  const existingSkills = await Skill.findAll({
    where: { id: validSkillIds },
    attributes: ['id'],
    transaction,
    raw: true,
  });
  const existingSkillIds = existingSkills.map((skill) => Number(skill.id));

  if (existingSkillIds.length !== validSkillIds.length) {
    const error = new Error('One or more selected skills do not exist');
    error.statusCode = 400;
    throw error;
  }

  await Worker_Skill.destroy({
    where: { worker_id: userId },
    transaction,
  });

  if (existingSkillIds.length > 0) {
    await Worker_Skill.bulkCreate(
      existingSkillIds.map((skillId) => ({
        worker_id: userId,
        skill_id: skillId,
      })),
      { transaction }
    );
  }
}

async function syncAvailability(userId, availability, transaction) {
  if (availability === undefined) {
    return;
  }

  // Always clear existing and recreate to keep it simple, or update if matches day
  await Availability.destroy({
    where: { user_id: userId },
    transaction,
  });

  if (Array.isArray(availability) && availability.length > 0) {
    const records = availability
      .filter((item) => item.day_of_week && item.start_time && item.end_time)
      .map((item) => ({
        user_id: userId,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        is_available: item.is_available !== false,
      }));

    if (records.length > 0) {
      await Availability.bulkCreate(records, { transaction });
    }
  }
}

async function persistWorkerProfile(req, res, { create = false } = {}) {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    let profile = null;

    if (create) {
      const userId = Number(req.body.user_id);

      if (!Number.isInteger(userId) || userId <= 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'user_id is required to create a worker profile' });
      }

      const existingProfile = await WorkerProfile.findOne({
        where: { user_id: userId },
        transaction,
      });

      if (existingProfile) {
        await transaction.rollback();
        return res.status(409).json({ message: 'This user already has a worker profile' });
      }

      profile = WorkerProfile.build({ user_id: userId });
    } else {
      profile = await WorkerProfile.findByPk(req.params.id, { transaction });

      if (!profile) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Worker profile not found' });
      }
    }

    const requestedUserId = req.body.user_id !== undefined ? Number(req.body.user_id) : undefined;
    const nextUserId = Number.isInteger(requestedUserId) && requestedUserId > 0
      ? requestedUserId
      : Number(profile.user_id);
    const user = await User.findByPk(nextUserId, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Linked user was not found' });
    }

    const minPrice = normalizePrice(req.body.min_price, 'min_price');
    const maxPrice = normalizePrice(req.body.max_price, 'max_price');

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice !== null &&
      maxPrice !== null &&
      minPrice > maxPrice
    ) {
      await transaction.rollback();
      return res.status(400).json({ message: 'min_price cannot be greater than max_price' });
    }

    const profileUpdates = {};
    const portfolioSource =
      req.body.portfolio_items !== undefined ? req.body.portfolio_items : req.body.p_images;

    if (create || req.body.user_id !== undefined) {
      profileUpdates.user_id = nextUserId;
    }

    if (create || req.body.bio !== undefined) {
      profileUpdates.bio = normalizeOptionalString(req.body.bio);
    }

    if (create || req.body.major !== undefined) {
      profileUpdates.major = normalizeOptionalString(req.body.major);
    }

    if (create || req.body.profile_image !== undefined) {
      profileUpdates.profile_image = normalizeOptionalString(req.body.profile_image);
    }

    if (create || portfolioSource !== undefined) {
      profileUpdates.p_images = serializePortfolioItems(portfolioSource);
    }

    if (minPrice !== undefined) {
      profileUpdates.min_price = minPrice;
    }

    if (maxPrice !== undefined) {
      profileUpdates.max_price = maxPrice;
    }

    const userInput =
      req.body.user && typeof req.body.user === 'object' ? req.body.user : req.body;
    const userUpdates = {};

    ['firstname', 'lastname', 'email', 'phone', 'location'].forEach((field) => {
      if (userInput[field] !== undefined) {
        userUpdates[field] = normalizeOptionalString(userInput[field]);
      }
    });

    if (Object.keys(userUpdates).length > 0) {
      await user.update(userUpdates, { transaction });
    }

    await profile.save({ transaction });
    await profile.update(profileUpdates, { transaction });

    if (req.body.skill_ids !== undefined) {
      await syncWorkerSkills(nextUserId, req.body.skill_ids, transaction);
    }

    if (req.body.availability !== undefined) {
      await syncAvailability(nextUserId, req.body.availability, transaction);
    }

    await transaction.commit();

    const savedProfile = await loadProfileById(profile.id);
    return res.status(create ? 201 : 200).json(formatWorkerProfile(savedProfile));
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    return res.status(error.statusCode || 500).json({
      message: create ? 'Failed to create worker profile' : 'Failed to update worker profile',
      error: error.message,
    });
  }
}

async function getWorkerProfile(req, res) {
  try {
    const { id } = req.params;
    const profile = await loadProfileById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    res.status(200).json(formatWorkerProfile(profile));
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch worker profile',
      error: error.message
    });
  }
}

async function getWorkerProfileByUserId(req, res) {
  try {
    const userId = Number(req.params.userId);
    const profile = await loadProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({ message: 'Worker profile not found for this user' });
    }

    res.status(200).json(formatWorkerProfile(profile));
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch worker profile',
      error: error.message,
    });
  }
}

async function getAllWorkerProfiles(req, res) {
  try {
    const profiles = await WorkerProfile.findAll({
      include: buildProfileInclude()
    });
    res.status(200).json(profiles.map((profile) => formatWorkerProfile(profile)));
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch worker profiles',
      error: error.message
    });
  }
}

async function createWorkerProfile(req, res) {
  return persistWorkerProfile(req, res, { create: true });
}

async function updateWorkerProfile(req, res) {
  return persistWorkerProfile(req, res, { create: false });
}

module.exports = {
  createWorkerProfile,
  getWorkerProfile,
  getWorkerProfileByUserId,
  getAllWorkerProfiles,
  updateWorkerProfile,
};
