'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 12;
    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'super_admin',
        first_name: 'System',
        last_name: 'Administrator',
        designation: 'Database Administrator',
        phone: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'exam.director@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'director',
        first_name: 'Dr. Rajesh',
        last_name: 'Kumar',
        designation: 'Director - Examinations and Evaluations',
        phone: '+91-9876543210',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'student.director@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'director',
        first_name: 'Dr. Priya',
        last_name: 'Sharma',
        designation: 'Director - Student Development',
        phone: '+91-9876543211',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'research.director@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'director',
        first_name: 'Dr. Amit',
        last_name: 'Patel',
        designation: 'Director - Research & Development',
        phone: '+91-9876543212',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'alumni.director@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'director',
        first_name: 'Dr. Sunita',
        last_name: 'Singh',
        designation: 'Director - Alumni Affairs',
        phone: '+91-9876543213',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'academic.director@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'director',
        first_name: 'Dr. Vikram',
        last_name: 'Joshi',
        designation: 'Director - Academic Council',
        phone: '+91-9876543214',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'studies.director@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'director',
        first_name: 'Dr. Meera',
        last_name: 'Gupta',
        designation: 'Director - Board of Studies',
        phone: '+91-9876543215',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'admin@university.edu',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'director',
        first_name: 'System',
        last_name: 'Administrator',
        designation: 'System Administrator',
        phone: '+1-555-0001',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'testdirector@university.edu',
        password_hash: await bcrypt.hash('director123', saltRounds),
        role: 'director',
        first_name: 'Test',
        last_name: 'Director',
        designation: 'Test Director',
        phone: '+1-555-0002',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: [
        'admin@university.edu',
        'board.director@university.edu', 
        'committee.director@university.edu'
      ]
    }, {});
  }
};
