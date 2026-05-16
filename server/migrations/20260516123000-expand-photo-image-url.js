'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Photos', 'image_url', {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Photos', 'image_url', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
