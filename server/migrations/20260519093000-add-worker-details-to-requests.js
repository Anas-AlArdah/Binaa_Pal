'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Requests');
    const columns = [
      ['worker_id', { type: Sequelize.INTEGER, allowNull: true }],
      ['worker_profile_id', { type: Sequelize.INTEGER, allowNull: true }],
      ['craft_name', { type: Sequelize.STRING, allowNull: true }],
      ['client_name', { type: Sequelize.STRING, allowNull: true }],
      ['client_email', { type: Sequelize.STRING, allowNull: true }],
      ['client_phone', { type: Sequelize.STRING, allowNull: true }],
    ];

    for (const [name, definition] of columns) {
      if (!table[name]) {
        await queryInterface.addColumn('Requests', name, definition);
      }
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Requests');
    const columns = [
      'client_phone',
      'client_email',
      'client_name',
      'craft_name',
      'worker_profile_id',
      'worker_id',
    ];

    for (const name of columns) {
      if (table[name]) {
        await queryInterface.removeColumn('Requests', name);
      }
    }
  },
};
