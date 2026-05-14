'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('project', {

      pro_id: {
        type: Sequelize.integer,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.integer,
        allowNull: false,
      },

      title_p: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      description_p: {
        type: Sequelize.text,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('project');
  }
};