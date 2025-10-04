'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, update existing director roles to admin before changing ENUM
    await queryInterface.sequelize.query(
      "UPDATE users SET role = 'super_admin' WHERE role = 'director'"
    );

    // Update user role ENUM to use admin and sub_admin instead of director
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('super_admin', 'admin', 'sub_admin'),
      allowNull: false,
      defaultValue: 'sub_admin'
    });

    // Add university_body_id to users table to link users to a specific university body
    await queryInterface.addColumn('users', 'university_body_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'university_bodies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Update university_bodies table to support admin_id instead of director_id
    await queryInterface.renameColumn('university_bodies', 'director_id', 'admin_id');
  },

  async down(queryInterface, Sequelize) {
    // Revert university_bodies column name
    await queryInterface.renameColumn('university_bodies', 'admin_id', 'director_id');

    // Remove university_body_id column
    await queryInterface.removeColumn('users', 'university_body_id');

    // Revert role changes - first update roles back
    await queryInterface.sequelize.query(
      "UPDATE users SET role = 'director' WHERE role IN ('admin', 'sub_admin')"
    );

    // Change role ENUM back to original
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('super_admin', 'director'),
      allowNull: false,
      defaultValue: 'director'
    });
  }
};