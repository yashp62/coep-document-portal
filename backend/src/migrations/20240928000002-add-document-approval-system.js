'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add approval status to documents table
    await queryInterface.addColumn('documents', 'approval_status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    });

    // Add approved_by field to track who approved the document
    await queryInterface.addColumn('documents', 'approved_by_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add approved_at timestamp
    await queryInterface.addColumn('documents', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Update existing documents to be approved (since they were public before)
    await queryInterface.sequelize.query(
      "UPDATE documents SET approval_status = 'approved' WHERE is_public = true"
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove the new columns
    await queryInterface.removeColumn('documents', 'approved_at');
    await queryInterface.removeColumn('documents', 'approved_by_id');
    await queryInterface.removeColumn('documents', 'approval_status');
  }
};