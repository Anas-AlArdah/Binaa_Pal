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

function getCraftValidationError(payload) {
  if (!payload.skill_name) {
    return 'اسم الصنعة مطلوب.';
  }

  if (payload.skill_name.length > 120) {
    return 'اسم الصنعة يجب ألا يتجاوز 120 حرفاً.';
  }

  if (!payload.slug) {
    return 'معرّف رابط الصنعة مطلوب.';
  }

  if (payload.slug.length > 120 || !SLUG_PATTERN.test(payload.slug)) {
    return 'معرّف الرابط يقبل أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط.';
  }

  if (payload.description.length < 10) {
    return 'اكتب وصفاً واضحاً للصنعة من 10 أحرف على الأقل.';
  }

  if (payload.description.length > 1000) {
    return 'وصف الصنعة يجب ألا يتجاوز 1000 حرف.';
  }

  if (!CRAFT_ICON_KEY_SET.has(payload.icon_key)) {
    return 'اختر أيقونة الصنعة من الخيارات المتاحة.';
  }

  return '';
}

module.exports = {
  CRAFT_ICON_KEYS,
  buildCraftPayload,
  getCraftValidationError,
};
