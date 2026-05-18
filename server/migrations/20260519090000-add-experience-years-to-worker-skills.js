'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Worker_Skills');

    if (!table.experience_years) {
      await queryInterface.addColumn('Worker_Skills', 'experience_years', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Worker_Skills');

    if (table.experience_years) {
      await queryInterface.removeColumn('Worker_Skills', 'experience_years');
    }
  },
};
