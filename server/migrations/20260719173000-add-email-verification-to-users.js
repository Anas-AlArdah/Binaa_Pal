'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'email_verification_code_hash', {
      allowNull: true,
      type: Sequelize.STRING(64),
    });

    await queryInterface.addColumn('Users', 'email_verification_expires_at', {
      allowNull: true,
      type: Sequelize.DATE,
    });

    await queryInterface.addColumn('Users', 'email_verification_attempts', {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Users', 'email_verification_sent_at', {
      allowNull: true,
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'email_verification_sent_at');
    await queryInterface.removeColumn('Users', 'email_verification_attempts');
    await queryInterface.removeColumn('Users', 'email_verification_expires_at');
    await queryInterface.removeColumn('Users', 'email_verification_code_hash');
  },
};
