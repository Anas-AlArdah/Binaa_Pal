'use strict';

const PALESTINE_CITIES = Object.freeze([
  'القدس',
  'رام الله',
  'البيرة',
  'نابلس',
  'الخليل',
  'بيت لحم',
  'جنين',
  'طولكرم',
  'قلقيلية',
  'سلفيت',
  'أريحا',
  'طوباس',
  'غزة',
  'خانيونس',
  'رفح',
  'دير البلح',
  'جباليا',
  'بيت لاهيا',
  'بيت حانون',
  'يافا',
  'حيفا',
  'عكا',
  'الناصرة',
  'اللد',
  'الرملة',
  'صفد',
  'طبريا',
  'بئر السبع',
  'أم الفحم',
  'سخنين',
  'شفا عمرو',
  'الطيبة',
  'الطيرة',
  'قلنسوة',
  'كفر قاسم',
  'عرابة',
  'طمرة',
  'رهط',
]);

const CITY_SET = new Set(PALESTINE_CITIES);

function isPalestineCity(value) {
  return CITY_SET.has(String(value || '').trim());
}

module.exports = {
  PALESTINE_CITIES,
  isPalestineCity,
};
