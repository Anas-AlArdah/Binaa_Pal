'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('availability');

    if (!table.skill_id) {
      await queryInterface.addColumn('availability', 'skill_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Skills',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    try {
      await queryInterface.addIndex('availability', ['user_id', 'skill_id', 'day_of_week'], {
        name: 'availability_user_skill_day_idx',
      });
    } catch (error) {
      if (!/Duplicate|already exists/i.test(error.message)) {
        throw error;
      }
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeIndex('availability', 'availability_user_skill_day_idx');
    } catch (error) {
      if (!/not exist|doesn't exist|not found/i.test(error.message)) {
        throw error;
      }
    }

    const table = await queryInterface.describeTable('availability');

    if (table.skill_id) {
      await queryInterface.removeColumn('availability', 'skill_id');
    }
  },
};
