'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Photos', {

      id: {
        type: Sequelize.integer,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      pro_id: {
        type: Sequelize.integer,
        allowNull: false,
        references: {
          model: 'project',
          key: 'pro_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      image_url: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('Photos');
  }
};