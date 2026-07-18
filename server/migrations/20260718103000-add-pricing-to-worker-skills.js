'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Worker_Skills');

    if (!table.min_price) {
      await queryInterface.addColumn('Worker_Skills', 'min_price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }

    if (!table.max_price) {
      await queryInterface.addColumn('Worker_Skills', 'max_price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Worker_Skills');

    if (table.max_price) {
      await queryInterface.removeColumn('Worker_Skills', 'max_price');
    }

    if (table.min_price) {
      await queryInterface.removeColumn('Worker_Skills', 'min_price');
    }
  },
};
