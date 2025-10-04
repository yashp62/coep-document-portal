'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 12;
    
    // First, get existing university bodies
    const universityBodies = await queryInterface.sequelize.query(
      'SELECT id, name, type FROM university_bodies ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create users with new role system
    const usersData = [
      // Super Admin (unchanged)
      {
        email: 'superadmin@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'super_admin',
        first_name: 'System',
        last_name: 'Super Admin',
        designation: 'System Administrator',
        university_body_id: null, // Super admin is not tied to any specific body
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Admin users (formerly directors) - each tied to a university body
      {
        email: 'admin.examinations@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'admin',
        first_name: 'Dr. Rajesh',
        last_name: 'Kumar',
        designation: 'Administrator - Examinations Board',
        university_body_id: universityBodies.find(b => b.name.includes('Examination'))?.id || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'admin.student@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'admin',
        first_name: 'Dr. Priya',
        last_name: 'Sharma',
        designation: 'Administrator - Student Development',
        university_body_id: universityBodies.find(b => b.name.includes('Student'))?.id || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'admin.academic@coep.ac.in',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        role: 'admin',
        first_name: 'Dr. Vikram',
        last_name: 'Joshi',
        designation: 'Administrator - Academic Council',
        university_body_id: universityBodies.find(b => b.name.includes('Academic'))?.id || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Sub-Admin users - assistants to admins
      {
        email: 'subadmin.exam1@coep.ac.in',
        password_hash: await bcrypt.hash('subadmin123', saltRounds),
        role: 'sub_admin',
        first_name: 'Prof. Amit',
        last_name: 'Patel',
        designation: 'Assistant Administrator - Examinations',
        university_body_id: universityBodies.find(b => b.name.includes('Examination'))?.id || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'subadmin.exam2@coep.ac.in',
        password_hash: await bcrypt.hash('subadmin123', saltRounds),
        role: 'sub_admin',
        first_name: 'Dr. Sunita',
        last_name: 'Singh',
        designation: 'Assistant Administrator - Examinations',
        university_body_id: universityBodies.find(b => b.name.includes('Examination'))?.id || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'subadmin.student@coep.ac.in',
        password_hash: await bcrypt.hash('subadmin123', saltRounds),
        role: 'sub_admin',
        first_name: 'Prof. Meera',
        last_name: 'Gupta',
        designation: 'Assistant Administrator - Student Affairs',
        university_body_id: universityBodies.find(b => b.name.includes('Student'))?.id || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'subadmin.academic@coep.ac.in',
        password_hash: await bcrypt.hash('subadmin123', saltRounds),
        role: 'sub_admin',
        first_name: 'Dr. Kiran',
        last_name: 'Verma',
        designation: 'Assistant Administrator - Academic Affairs',
        university_body_id: universityBodies.find(b => b.name.includes('Academic'))?.id || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', usersData, {});

    // Update existing documents to include approval workflow demo data
    const documents = await queryInterface.sequelize.query(
      'SELECT id FROM documents ORDER BY id LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role IN ("admin", "sub_admin") ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (documents.length > 0 && users.length > 0) {
      // Update some documents with approval status
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await queryInterface.sequelize.query(`
        UPDATE documents 
        SET approval_status = 'approved',
            approved_by_id = ${users[0].id},
            approved_at = '${now}'
        WHERE id = ${documents[0].id}
      `);

      if (documents.length > 1) {
        await queryInterface.sequelize.query(`
          UPDATE documents 
          SET approval_status = 'pending',
              requested_at = '${now}'
          WHERE id = ${documents[1].id}
        `);
      }

      if (documents.length > 2) {
        await queryInterface.sequelize.query(`
          UPDATE documents 
          SET approval_status = 'rejected',
              approved_by_id = ${users[1]?.id || users[0].id},
              approved_at = '${now}',
              rejection_reason = 'Document requires additional review and updates.'
          WHERE id = ${documents[2].id}
        `);
      }
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove the new users created by this seeder
    await queryInterface.bulkDelete('users', {
      email: [
        'superadmin@coep.ac.in',
        'admin.examinations@coep.ac.in',
        'admin.student@coep.ac.in',
        'admin.academic@coep.ac.in',
        'subadmin.exam1@coep.ac.in',
        'subadmin.exam2@coep.ac.in',
        'subadmin.student@coep.ac.in',
        'subadmin.academic@coep.ac.in'
      ]
    }, {});

    // Reset document approval status
    await queryInterface.sequelize.query(`
      UPDATE documents 
      SET approval_status = 'pending',
          approved_by_id = NULL,
          approved_at = NULL,
          requested_at = NULL,
          rejection_reason = NULL
    `);
  }
};