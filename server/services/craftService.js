const { Op, fn, col } = require('sequelize');
const { Skill, Worker_Skill, User, WorkerProfile, Review } = require('../models');
const { getProfileImage } = require('../utils/workerProfileData');

const CRAFT_METADATA = [
  ['tiling', 'tiling', 'التبليط', 'تبليط الأرضيات والجدران', ['tiling', 'tile', 'ceramic', 'تبليط', 'بلاط']],
  ['painting', 'painting', 'الدهان', 'دهان داخلي وخارجي وتشطيبات', ['painting', 'paint', 'دهان', 'دهن']],
  ['electrical', 'electrical', 'الكهرباء', 'تمديدات كهربائية وإنارة وصيانة', ['electrical', 'electric', 'كهرب']],
  ['plumbing', 'plumbing', 'السباكة', 'تمديدات مياه وصرف صحي وسخانات', ['plumbing', 'plumber', 'سباك', 'مياه']],
  ['gypsum', 'gypsum', 'الجبس والأسقف', 'أسقف مستعارة وجبس بورد وديكورات', ['gypsum', 'drywall', 'جبس', 'أسقف', 'اسقف']],
  ['carpentry', 'carpentry', 'النجارة', 'أثاث مخصص وأبواب ومطابخ وأعمال خشبية', ['carpentry', 'carpenter', 'نجار']],
  ['aluminum', 'aluminum', 'الألمنيوم والحديد', 'شبابيك وأبواب وأعمال معدنية', ['aluminum', 'aluminium', 'metal', 'ألمنيوم', 'المنيوم', 'حديد']],
  ['masonry', 'masonry', 'البناء والحجر', 'أعمال حجر وبناء وجدران إنشائية', ['masonry', 'building', 'stone', 'بناء', 'حجر', 'بلوك']],
].map(([slug, iconKey, name, description, keywords]) => ({
  slug,
  iconKey,
  name,
  description,
  keywords,
}));

const USER_ATTRIBUTES = ['id', 'firstname', 'lastname', 'phone', 'location'];
const PROFILE_ATTRIBUTES = ['id', 'user_id', 'profile_image', 'p_images', 'min_price', 'max_price', 'createdAt'];

const toPlain = (model) => (model?.get ? model.get({ plain: true }) : model);
const uniqueNumbers = (values) => [...new Set(values.map(Number).filter(Number.isFinite))];
const average = (values) => (
  values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : 0
);

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

async function getWorkerCountBySkillId() {
  const rows = await Worker_Skill.findAll({
    attributes: [
      'skill_id',
      [fn('COUNT', fn('DISTINCT', col('worker_id'))), 'workers'],
    ],
    group: ['skill_id'],
    raw: true,
  });

  return new Map(rows.map((row) => [Number(row.skill_id), Number(row.workers) || 0]));
}

function buildCraft(skill, countBySkillId) {
  const meta = findMetadata(skill.skill_name) || {};

  return {
    id: skill.id,
    skill_name: skill.skill_name,
    name: skill.skill_name || meta.name || 'Craft',
    slug: meta.slug || makeSlug(skill.skill_name) || `skill-${skill.id}`,
    description: meta.description || '',
    iconKey: meta.iconKey || 'default',
    workers: countBySkillId.get(Number(skill.id)) || 0,
  };
}

async function getCrafts() {
  const [skills, countBySkillId] = await Promise.all([
    Skill.findAll({ attributes: ['id', 'skill_name'], order: [['id', 'ASC']], raw: true }),
    getWorkerCountBySkillId(),
  ]);

  return skills.map((skill) => buildCraft(skill, countBySkillId));
}

async function findCraft(slugOrId) {
  const value = decodeValue(slugOrId).toLowerCase();
  const crafts = await getCrafts();

  return crafts.find((craft) =>
    String(craft.id) === value || String(craft.slug).toLowerCase() === value
  );
}

function decodeValue(value) {
  try {
    return decodeURIComponent(String(value || ''));
  } catch (error) {
    return String(value || '');
  }
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? String(number) : String(value);
}

function formatPrice(profile) {
  const min = formatNumber(profile?.min_price);
  const max = formatNumber(profile?.max_price);

  return min && max ? `${min} - ${max}` : min || max || 'N/A';
}

function getPriceSort(profile) {
  const prices = [Number(profile?.max_price), Number(profile?.min_price)];
  return prices.find(Number.isFinite) ?? Number.MAX_SAFE_INTEGER;
}

function formatExperienceYears(value) {
  const years = Number(value);

  if (!Number.isInteger(years) || years < 0) {
    return '';
  }

  if (years === 0) {
    return 'أقل من سنة';
  }

  if (years === 1) {
    return 'سنة واحدة';
  }

  if (years === 2) {
    return 'سنتان';
  }

  return years <= 10 ? `${years} سنوات` : `${years} سنة`;
}

function getExperience(profile) {
  if (!profile?.createdAt) {
    return 'N/A';
  }

  return formatExperienceYears(Math.max(1, new Date().getFullYear() - new Date(profile.createdAt).getFullYear()));
}

function getReviewStats(profile) {
  const reviews = Array.isArray(profile?.reviews) ? profile.reviews : [];
  const ratings = reviews.map((review) => Number(review.rating)).filter(Number.isFinite);
  const punctuality = reviews.map((review) => Number(review.punctuality)).filter(Number.isFinite);

  return {
    rating: average(ratings),
    reviewsCount: ratings.length,
    punctualityRating: average(punctuality),
    punctualityCount: punctuality.length,
  };
}

function getCity(location) {
  return String(location || '')
    .split(/,|\u060c/)
    .map((part) => part.trim())
    .filter(Boolean)[0] || 'N/A';
}

function getWorkerName(user) {
  return [user?.firstname, user?.lastname].filter(Boolean).join(' ').trim() || 'Worker';
}

function buildWorker(user, craft) {
  const profile = user.worker_profile || null;
  const workerSkills = Array.isArray(user.worker_skills) ? user.worker_skills : [];
  const craftSkillLink = workerSkills.find((link) =>
    Number(link.skill_id || link.skill?.id) === Number(craft.id)
  );
  const skillNames = [
    ...new Set(workerSkills.map((link) => link.skill?.skill_name).filter(Boolean)),
  ];
  const stats = getReviewStats(profile);
  const location = user.location || '';
  const craftExperience = formatExperienceYears(craftSkillLink?.experience_years);

  return {
    id: profile?.id || user.id,
    userId: user.id,
    profileId: profile?.id || null,
    name: getWorkerName(user),
    city: getCity(location),
    location,
    phone: user.phone || '',
    craftSlug: craft.slug,
    craftName: craft.name,
    secondarySkill: skillNames.find((skillName) => skillName !== craft.name && skillName !== craft.skill_name) || '',
    skills: skillNames,
    rating: stats.rating,
    reviewsCount: stats.reviewsCount,
    punctualityRating: stats.punctualityRating,
    punctualityCount: stats.punctualityCount,
    experience: craftExperience || getExperience(profile),
    price: formatPrice(profile),
    priceSort: getPriceSort(profile),
    imageUrl: getProfileImage(profile),
  };
}

async function getCraftWorkers(slugOrId) {
  const craft = await findCraft(slugOrId);

  if (!craft) {
    return null;
  }

  const selectedLinks = await Worker_Skill.findAll({
    where: { skill_id: craft.id },
    attributes: ['worker_id'],
    raw: true,
  });
  const workerIds = uniqueNumbers(selectedLinks.map((link) => link.worker_id));

  if (!workerIds.length) {
    return { craft, count: 0, workers: [] };
  }

  const users = (await User.findAll({
    where: { id: { [Op.in]: workerIds } },
    attributes: USER_ATTRIBUTES,
    include: [
      {
        model: WorkerProfile,
        as: 'worker_profile',
        attributes: PROFILE_ATTRIBUTES,
        required: false,
        include: [{ model: Review, as: 'reviews', attributes: ['id', 'rating', 'punctuality', 'comment', 'date'] }],
      },
      {
        model: Worker_Skill,
        as: 'worker_skills',
        attributes: ['skill_id', 'experience_years'],
        required: false,
        include: [{ model: Skill, as: 'skill', attributes: ['id', 'skill_name'] }],
      },
    ],
  })).map(toPlain);

  const workers = users.map((user) => buildWorker(user, craft));

  return { craft, count: workers.length, workers };
}

module.exports = {
  findCraft,
  getCrafts,
  getCraftWorkers,
  getWorkerCountBySkillId,
};
