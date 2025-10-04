'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add requested_at field to track when approval was requested
    await queryInterface.addColumn('documents', 'requested_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add rejection_reason field to provide feedback on rejected documents
    await queryInterface.addColumn('documents', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the new columns
    await queryInterface.removeColumn('documents', 'rejection_reason');
    await queryInterface.removeColumn('documents', 'requested_at');
  }
};