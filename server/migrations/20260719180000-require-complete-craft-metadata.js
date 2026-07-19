'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [incompleteCrafts] = await queryInterface.sequelize.query(`
      SELECT "id", "skill_name"
      FROM "Skills"
      WHERE length(btrim(COALESCE("skill_name", ''))) = 0
         OR length(btrim(COALESCE("slug", ''))) = 0
         OR length(btrim(COALESCE("description", ''))) = 0
         OR length(btrim(COALESCE("icon_key", ''))) = 0
    `);

    if (incompleteCrafts.length) {
      const craftIds = incompleteCrafts.map((craft) => craft.id).join(', ');
      throw new Error(`Cannot require craft metadata while incomplete Skills exist: ${craftIds}`);
    }

    await queryInterface.changeColumn('Skills', 'description', {
      allowNull: false,
      type: Sequelize.TEXT,
    });
    await queryInterface.changeColumn('Skills', 'icon_key', {
      allowNull: false,
      type: Sequelize.STRING(80),
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "Skills"
      ADD CONSTRAINT "skills_name_not_blank"
        CHECK (length(btrim("skill_name")) > 0),
      ADD CONSTRAINT "skills_slug_not_blank"
        CHECK (length(btrim("slug")) > 0),
      ADD CONSTRAINT "skills_slug_format"
        CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
      ADD CONSTRAINT "skills_description_not_blank"
        CHECK (length(btrim("description")) > 0),
      ADD CONSTRAINT "skills_icon_key_not_blank"
        CHECK (length(btrim("icon_key")) > 0)
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Skills"
      DROP CONSTRAINT IF EXISTS "skills_name_not_blank",
      DROP CONSTRAINT IF EXISTS "skills_slug_not_blank",
      DROP CONSTRAINT IF EXISTS "skills_slug_format",
      DROP CONSTRAINT IF EXISTS "skills_description_not_blank",
      DROP CONSTRAINT IF EXISTS "skills_icon_key_not_blank"
    `);

    await queryInterface.changeColumn('Skills', 'description', {
      allowNull: true,
      type: Sequelize.TEXT,
    });
    await queryInterface.changeColumn('Skills', 'icon_key', {
      allowNull: true,
      type: Sequelize.STRING(80),
    });
  },
};
