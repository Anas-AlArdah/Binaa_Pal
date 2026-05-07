const { Op, fn, col } = require('sequelize');
const { Skill, Worker_Skill, User, WorkerProfile, Review } = require('../models');

const CRAFT_METADATA = [
  {
    slug: 'tiling',
    iconKey: 'tiling',
    name: '\u0627\u0644\u062a\u0628\u0644\u064a\u0637',
    description:
      '\u062a\u0628\u0644\u064a\u0637 \u0627\u0644\u0623\u0631\u0636\u064a\u0627\u062a \u0648\u0627\u0644\u062c\u062f\u0631\u0627\u0646',
    keywords: ['tiling', 'tile', 'ceramic', '\u062a\u0628\u0644\u064a\u0637', '\u0628\u0644\u0627\u0637'],
  },
  {
    slug: 'painting',
    iconKey: 'painting',
    name: '\u0627\u0644\u062f\u0647\u0627\u0646',
    description:
      '\u062f\u0647\u0627\u0646 \u062f\u0627\u062e\u0644\u064a \u0648\u062e\u0627\u0631\u062c\u064a \u0648\u062a\u0634\u0637\u064a\u0628\u0627\u062a',
    keywords: ['painting', 'paint', '\u062f\u0647\u0627\u0646', '\u062f\u0647\u0646'],
  },
  {
    slug: 'electrical',
    iconKey: 'electrical',
    name: '\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621',
    description:
      '\u062a\u0645\u062f\u064a\u062f\u0627\u062a \u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629 \u0648\u0625\u0646\u0627\u0631\u0629 \u0648\u0635\u064a\u0627\u0646\u0629',
    keywords: ['electrical', 'electric', '\u0643\u0647\u0631\u0628'],
  },
  {
    slug: 'plumbing',
    iconKey: 'plumbing',
    name: '\u0627\u0644\u0633\u0628\u0627\u0643\u0629',
    description:
      '\u062a\u0645\u062f\u064a\u062f\u0627\u062a \u0645\u064a\u0627\u0647 \u0648\u0635\u0631\u0641 \u0635\u062d\u064a \u0648\u0633\u062e\u0627\u0646\u0627\u062a',
    keywords: ['plumbing', 'plumber', '\u0633\u0628\u0627\u0643', '\u0645\u064a\u0627\u0647'],
  },
  {
    slug: 'gypsum',
    iconKey: 'gypsum',
    name: '\u0627\u0644\u062c\u0628\u0633 \u0648\u0627\u0644\u0623\u0633\u0642\u0641',
    description:
      '\u0623\u0633\u0642\u0641 \u0645\u0633\u062a\u0639\u0627\u0631\u0629 \u0648\u062c\u0628\u0633 \u0628\u0648\u0631\u062f \u0648\u062f\u064a\u0643\u0648\u0631\u0627\u062a',
    keywords: ['gypsum', 'drywall', '\u062c\u0628\u0633', '\u0623\u0633\u0642\u0641', '\u0627\u0633\u0642\u0641'],
  },
  {
    slug: 'carpentry',
    iconKey: 'carpentry',
    name: '\u0627\u0644\u0646\u062c\u0627\u0631\u0629',
    description:
      '\u0623\u062b\u0627\u062b \u0645\u062e\u0635\u0635 \u0648\u0623\u0628\u0648\u0627\u0628 \u0648\u0645\u0637\u0627\u0628\u062e \u0648\u0623\u0639\u0645\u0627\u0644 \u062e\u0634\u0628\u064a\u0629',
    keywords: ['carpentry', 'carpenter', '\u0646\u062c\u0627\u0631'],
  },
  {
    slug: 'aluminum',
    iconKey: 'aluminum',
    name: '\u0627\u0644\u0623\u0644\u0645\u0646\u064a\u0648\u0645 \u0648\u0627\u0644\u062d\u062f\u064a\u062f',
    description:
      '\u0634\u0628\u0627\u0628\u064a\u0643 \u0648\u0623\u0628\u0648\u0627\u0628 \u0648\u0623\u0639\u0645\u0627\u0644 \u0645\u0639\u062f\u0646\u064a\u0629',
    keywords: ['aluminum', 'aluminium', 'metal', '\u0623\u0644\u0645\u0646\u064a\u0648\u0645', '\u0627\u0644\u0645\u0646\u064a\u0648\u0645', '\u062d\u062f\u064a\u062f'],
  },
  {
    slug: 'masonry',
    iconKey: 'masonry',
    name: '\u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u062d\u062c\u0631',
    description:
      '\u0623\u0639\u0645\u0627\u0644 \u062d\u062c\u0631 \u0648\u0628\u0646\u0627\u0621 \u0648\u062c\u062f\u0631\u0627\u0646 \u0625\u0646\u0634\u0627\u0626\u064a\u0629',
    keywords: ['masonry', 'building', 'stone', '\u0628\u0646\u0627\u0621', '\u062d\u062c\u0631', '\u0628\u0644\u0648\u0643'],
  },
];

const OPTIONAL_SKILL_COLUMNS = ['slug', 'description', 'icon_key'];

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064b-\u065f\u0670]/g, '');
}

function makeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findMetadata(skillName) {
  const normalizedName = normalizeText(skillName);

  return CRAFT_METADATA.find((meta) =>
    meta.keywords.some((keyword) => normalizedName.includes(normalizeText(keyword)))
  );
}

async function getExistingOptionalSkillColumns() {
  try {
    const columns = await Skill.sequelize.getQueryInterface().describeTable(Skill.getTableName());
    return OPTIONAL_SKILL_COLUMNS.filter((column) => Boolean(columns[column]));
  } catch (error) {
    return [];
  }
}

async function getSkillRows() {
  const optionalColumns = await getExistingOptionalSkillColumns();

  return Skill.findAll({
    attributes: ['id', 'skill_name', ...optionalColumns],
    order: [['id', 'ASC']],
    raw: true,
  });
}

async function getWorkerCountBySkillId() {
  try {
    const counts = await Worker_Skill.findAll({
      attributes: ['skill_id', [fn('COUNT', fn('DISTINCT', col('worker_id'))), 'workers']],
      group: ['skill_id'],
      raw: true,
    });

    return new Map(counts.map((row) => [Number(row.skill_id), Number(row.workers) || 0]));
  } catch (error) {
    return new Map();
  }
}

function buildCraft(row, workerCountBySkillId) {
  const meta = findMetadata(row.skill_name) || {};
  const slug = row.slug || meta.slug || makeSlug(row.skill_name) || `skill-${row.id}`;

  return {
    id: row.id,
    skill_name: row.skill_name,
    name: row.skill_name || meta.name || 'Craft',
    slug,
    description: row.description || meta.description || '',
    iconKey: row.icon_key || meta.iconKey || 'default',
    workers: workerCountBySkillId.get(Number(row.id)) || 0,
  };
}

async function getCraftObjects() {
  const [skillRows, workerCountBySkillId] = await Promise.all([
    getSkillRows(),
    getWorkerCountBySkillId(),
  ]);

  return skillRows.map((row) => buildCraft(row, workerCountBySkillId));
}

async function findCraft(slugOrId) {
  const crafts = await getCraftObjects();
  let normalizedSlug = String(slugOrId || '');

  try {
    normalizedSlug = decodeURIComponent(normalizedSlug);
  } catch (error) {
    normalizedSlug = String(slugOrId || '');
  }

  normalizedSlug = normalizedSlug.toLowerCase();

  return crafts.find(
    (craft) => String(craft.slug).toLowerCase() === normalizedSlug || String(craft.id) === normalizedSlug
  );
}

async function tableExists(tableName) {
  try {
    const tables = await Skill.sequelize.getQueryInterface().showAllTables();
    const wanted = String(tableName).toLowerCase();

    return tables.some((table) => {
      const name = typeof table === 'object' ? Object.values(table)[0] : table;
      return String(name).toLowerCase() === wanted;
    });
  } catch (error) {
    return false;
  }
}

function toPlain(model) {
  return model && typeof model.get === 'function' ? model.get({ plain: true }) : model;
}

function uniqueNumbers(values) {
  return [...new Set(values.map((value) => Number(value)).filter((value) => Number.isFinite(value)))];
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? String(numericValue) : String(value);
}

function formatPrice(profile) {
  const minPrice = formatNumber(profile?.min_price);
  const maxPrice = formatNumber(profile?.max_price);

  if (minPrice && maxPrice) {
    return `${minPrice} - ${maxPrice}`;
  }

  return minPrice || maxPrice || 'N/A';
}

function getPriceSort(profile) {
  const maxPrice = Number(profile?.max_price);
  const minPrice = Number(profile?.min_price);

  if (Number.isFinite(maxPrice)) {
    return maxPrice;
  }

  if (Number.isFinite(minPrice)) {
    return minPrice;
  }

  return Number.MAX_SAFE_INTEGER;
}

function getExperience(profile) {
  if (!profile?.createdAt) {
    return 'N/A';
  }

  const createdAt = new Date(profile.createdAt);
  const years = new Date().getFullYear() - createdAt.getFullYear();

  return `${Math.max(1, years)} years`;
}

function getFirstPortfolioImage(profile) {
  return String(profile?.p_images || '')
    .split(',')
    .map((image) => image.trim())
    .filter(Boolean)[0] || null;
}

function getReviewStats(profile) {
  const reviews = Array.isArray(profile?.reviews) ? profile.reviews : [];
  const ratings = reviews
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating));

  if (ratings.length === 0) {
    return { rating: 0, reviewsCount: 0 };
  }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

  return {
    rating: Number(average.toFixed(1)),
    reviewsCount: ratings.length,
  };
}

function getCity(location) {
  return String(location || '')
    .split(/,|\u060c/)
    .map((part) => part.trim())
    .filter(Boolean)[0] || 'N/A';
}

function getName(user) {
  return [user?.firstname, user?.lastname].filter(Boolean).join(' ').trim() || 'Worker';
}

function groupSkillNamesByWorkerId(skillLinks) {
  const grouped = new Map();

  skillLinks.forEach((linkModel) => {
    const link = toPlain(linkModel);
    const workerId = Number(link.worker_id);
    const skillName = link.skill?.skill_name;

    if (!Number.isFinite(workerId) || !skillName) {
      return;
    }

    if (!grouped.has(workerId)) {
      grouped.set(workerId, []);
    }

    grouped.get(workerId).push(skillName);
  });

  return grouped;
}

function getSkillNamesForWorker(identifiers, skillNamesByWorkerId) {
  return [
    ...new Set(
      identifiers
        .flatMap((identifier) => skillNamesByWorkerId.get(Number(identifier)) || [])
        .filter(Boolean)
    ),
  ];
}

function buildWorker({ workerId, craft, user, profile, skillNames }) {
  const stats = getReviewStats(profile);
  const location = user?.location || '';
  const secondarySkill =
    skillNames.find((skillName) => skillName !== craft.name && skillName !== craft.skill_name) ||
    profile?.major ||
    '';

  return {
    id: profile?.id || user?.id || workerId,
    userId: user?.id || profile?.user_id || null,
    profileId: profile?.id || null,
    name: getName(user),
    city: getCity(location),
    location,
    phone: user?.phone || '',
    craftSlug: craft.slug,
    craftName: craft.name,
    secondarySkill,
    skills: skillNames,
    rating: stats.rating,
    reviewsCount: stats.reviewsCount,
    verifiedCount: stats.reviewsCount ? Math.round(stats.rating * 20) : 0,
    experience: getExperience(profile),
    price: formatPrice(profile),
    priceSort: getPriceSort(profile),
    availableNow: true,
    imageUrl: getFirstPortfolioImage(profile),
  };
}

async function getAllCrafts(req, res) {
  try {
    const crafts = await getCraftObjects();
    res.status(200).json(crafts);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch crafts',
      error: error.message,
    });
  }
}

async function getCraftBySlug(req, res) {
  try {
    const craft = await findCraft(req.params.slug);

    if (!craft) {
      return res.status(404).json({ message: 'Craft not found' });
    }

    res.status(200).json(craft);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch craft',
      error: error.message,
    });
  }
}

async function getWorkersByCraft(req, res) {
  try {
    const craft = await findCraft(req.params.slug);

    if (!craft) {
      return res.status(404).json({ message: 'Craft not found' });
    }

    const selectedSkillLinks = await Worker_Skill.findAll({
      where: { skill_id: craft.id },
      raw: true,
    });
    const workerIds = uniqueNumbers(selectedSkillLinks.map((link) => link.worker_id));

    if (workerIds.length === 0) {
      return res.status(200).json({ craft, count: 0, workers: [] });
    }

    const users = (await User.findAll({
      where: { id: { [Op.in]: workerIds } },
      attributes: ['id', 'firstname', 'lastname', 'phone', 'location'],
    })).map(toPlain);

    const workerProfileTableExists = await tableExists(WorkerProfile.getTableName());
    const reviewTableExists = await tableExists(Review.getTableName());
    let profiles = [];

    if (workerProfileTableExists) {
      const include = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'phone', 'location'],
        },
      ];

      if (reviewTableExists) {
        include.push({
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating', 'comment', 'date'],
        });
      }

      profiles = (await WorkerProfile.findAll({
        where: {
          [Op.or]: [{ id: { [Op.in]: workerIds } }, { user_id: { [Op.in]: workerIds } }],
        },
        attributes: ['id', 'user_id', 'bio', 'major', 'p_images', 'min_price', 'max_price', 'createdAt'],
        include,
      })).map(toPlain);
    }

    const userById = new Map(users.map((user) => [Number(user.id), user]));
    const profileById = new Map(profiles.map((profile) => [Number(profile.id), profile]));
    const profileByUserId = new Map(profiles.map((profile) => [Number(profile.user_id), profile]));

    profiles.forEach((profile) => {
      if (profile.user?.id && !userById.has(Number(profile.user.id))) {
        userById.set(Number(profile.user.id), profile.user);
      }
    });

    const skillLookupIds = uniqueNumbers([
      ...workerIds,
      ...profiles.map((profile) => profile.id),
      ...profiles.map((profile) => profile.user_id),
      ...Array.from(userById.keys()),
    ]);

    const allSkillLinks = await Worker_Skill.findAll({
      where: { worker_id: { [Op.in]: skillLookupIds } },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'skill_name'],
        },
      ],
    });
    const skillNamesByWorkerId = groupSkillNamesByWorkerId(allSkillLinks);
    const seenWorkers = new Set();
    const workers = [];

    workerIds.forEach((workerId) => {
      const profile = profileById.get(workerId) || profileByUserId.get(workerId) || null;
      const user = userById.get(workerId) || profile?.user || userById.get(Number(profile?.user_id)) || null;
      const identifiers = uniqueNumbers([workerId, profile?.id, profile?.user_id, user?.id]);
      const dedupeKey = profile?.id ? `profile:${profile.id}` : user?.id ? `user:${user.id}` : `worker:${workerId}`;

      if (seenWorkers.has(dedupeKey)) {
        return;
      }

      seenWorkers.add(dedupeKey);

      workers.push(
        buildWorker({
          workerId,
          craft,
          user,
          profile,
          skillNames: getSkillNamesForWorker(identifiers, skillNamesByWorkerId),
        })
      );
    });

    res.status(200).json({
      craft,
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch craft workers',
      error: error.message,
    });
  }
}

module.exports = {
  getAllCrafts,
  getCraftBySlug,
  getWorkersByCraft,
};
