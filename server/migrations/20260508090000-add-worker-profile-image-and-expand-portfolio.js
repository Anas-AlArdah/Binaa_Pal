'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('WorkerProfiles', 'profile_image', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      after: 'major',
    });

    await queryInterface.changeColumn('WorkerProfiles', 'p_images', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('WorkerProfiles', 'profile_image');

    await queryInterface.changeColumn('WorkerProfiles', 'p_images', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
