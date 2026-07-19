'use strict';

const CRAFT_ICON_KEYS = Object.freeze([
  'tiling',
  'painting',
  'electrical',
  'plumbing',
  'gypsum',
  'carpentry',
  'aluminum',
  'masonry',
  'construction',
  'appliances',
  'blacksmithing',
  'interior-design',
  'doors',
  'locks',
  'cleaning',
  'roofing',
  'gardening',
  'hvac',
  'refrigeration',
  'solar',
  'fire-safety',
  'roads',
  'waterproofing',
  'bathrooms',
  'sanitary',
  'surveying',
  'engineering',
  'warehousing',
  'transport',
  'repairs',
  'finishing',
]);

const CRAFT_ICON_KEY_SET = new Set(CRAFT_ICON_KEYS);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function cleanString(value) {
  return String(value || '').trim();
}

function buildCraftPayload(body = {}) {
  return {
    skill_name: cleanString(body.skill_name || body.name),
    slug: cleanString(body.slug).toLowerCase(),
    description: cleanString(body.description),
    icon_key: cleanString(body.icon_key || body.iconKey).toLowerCase(),
  };
}

function slugifyCraftName(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getCraftSlugBase(payload = {}) {
  return slugifyCraftName(payload.slug)
    || slugifyCraftName(payload.icon_key)
    || slugifyCraftName(payload.skill_name)
    || 'craft';
}

function getCraftValidationError(payload) {
  if (!payload.skill_name) {
    return 'اسم الصنعة مطلوب.';
  }

  if (payload.skill_name.length > 120) {
    return 'اسم الصنعة يجب ألا يتجاوز 120 حرفا.';
  }

  if (payload.slug && (payload.slug.length > 120 || !SLUG_PATTERN.test(payload.slug))) {
    return 'معرف الرابط غير صالح.';
  }

  if (payload.description.length < 10) {
    return 'اكتب وصفا واضحا للصنعة من 10 احرف على الاقل.';
  }

  if (payload.description.length > 1000) {
    return 'وصف الصنعة يجب ألا يتجاوز 1000 حرف.';
  }

  if (!CRAFT_ICON_KEY_SET.has(payload.icon_key)) {
    return 'اختر ايقونة الصنعة من الخيارات المتاحة.';
  }

  return '';
}

module.exports = {
  CRAFT_ICON_KEYS,
  buildCraftPayload,
  getCraftSlugBase,
  getCraftValidationError,
};
