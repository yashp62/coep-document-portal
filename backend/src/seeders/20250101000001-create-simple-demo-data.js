'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 12;
    
    // Create basic users without university_body_id dependency
    const usersData = [
      // Super Admin
      {
        email: 'superadmin@coep.ac.in',
        password_hash: await bcrypt.hash('superadmin123', saltRounds),
        role: 'super_admin',
        first_name: 'System',
        last_name: 'Super Admin',
        designation: 'System Administrator',
        university_body_id: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Admin
      {
        email: 'admin@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'admin',
        first_name: 'Dr. Admin',
        last_name: 'User',
        designation: 'Administrator',
        university_body_id: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Sub Admin
      {
        email: 'subadmin@coep.ac.in',
        password_hash: await bcrypt.hash('subadmin123', saltRounds),
        role: 'sub_admin',
        first_name: 'Sub Admin',
        last_name: 'User',
        designation: 'Assistant Administrator',
        university_body_id: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert users
    await queryInterface.bulkInsert('users', usersData, {});

    // Create default categories
    const categoriesData = [
      {
        name: 'Academic',
        description: 'Academic related documents',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Administrative',
        description: 'Administrative documents',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Financial',
        description: 'Financial documents',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'General',
        description: 'General documents',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('categories', categoriesData, {});

    // Create university bodies
    const universityBodiesData = [
      {
        name: 'Academic Council',
        type: 'board',
        description: 'Main academic governing body',
        admin_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Finance Committee',
        type: 'committee',
        description: 'Financial oversight committee',
        admin_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Student Development Board',
        type: 'board',
        description: 'Student affairs and development',
        admin_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Examination Board',
        type: 'board',
        description: 'Examination and evaluation oversight',
        admin_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('university_bodies', universityBodiesData, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('university_bodies', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};