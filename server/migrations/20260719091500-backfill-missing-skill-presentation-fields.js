'use strict';

function makeSlug(value, fallback) {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}

module.exports = {
  async up(queryInterface) {
    const [skills] = await queryInterface.sequelize.query(
      'SELECT id, skill_name, slug, description, icon_key FROM `Skills`'
    );

    for (const skill of skills) {
      const slug = skill.slug || makeSlug(skill.skill_name, `skill-${skill.id}`);

      await queryInterface.bulkUpdate(
        'Skills',
        {
          slug,
          description: skill.description || '',
          icon_key: skill.icon_key || slug,
          updatedAt: new Date(),
        },
        { id: skill.id }
      );
    }
  },

  async down() {
    return Promise.resolve();
  },
};
