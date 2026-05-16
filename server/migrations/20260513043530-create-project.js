'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.createTable('project', {

            pro_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
               allowNull: true,
            },

            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },

            title_p: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            description_p: {
                type: Sequelize.TEXT,
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