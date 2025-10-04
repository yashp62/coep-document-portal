'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Insert additional university bodies for comprehensive demo
    await queryInterface.bulkInsert('university_bodies', [
      {
        name: 'Research and Development Board',
        type: 'Board',
        description: 'Oversees all research activities and development initiatives within the university',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Alumni Affairs Committee',
        type: 'Committee',
        description: 'Manages relationships with alumni and coordinates alumni events',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'International Relations Committee',
        type: 'Committee',
        description: 'Handles international partnerships and exchange programs',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Library Advisory Board',
        type: 'Board',
        description: 'Provides guidance on library policies and resource management',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sports and Recreation Committee',
        type: 'Committee',
        description: 'Organizes sports activities and recreational programs for students',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Get admin users for document creation
    const adminUsers = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role IN ("admin", "sub_admin") ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const universityBodies = await queryInterface.sequelize.query(
      'SELECT id FROM university_bodies ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminUsers.length > 0 && universityBodies.length > 0) {
      // Create demo documents with various approval states
      const dummyPdfData = Buffer.from('JVBERi0xLjQKJeLjz9MKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWzMgMCBSXQo+PgplbmRvYmoKCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxODMKJSVFT0Y=', 'base64');

      await queryInterface.bulkInsert('documents', [
        {
          title: 'Research Grant Application Guidelines 2025',
          description: 'Comprehensive guidelines for faculty applying for research grants in the academic year 2025-2026.',
          file_data: dummyPdfData,
          file_name: 'research_grant_guidelines_2025.pdf',
          mime_type: 'application/pdf',
          file_size: 245760,
          uploaded_by_id: adminUsers[0].id,
          university_body_id: universityBodies.find(b => Math.random() > 0.5)?.id || universityBodies[0].id,
          is_public: true,
          approval_status: 'approved',
          approved_by_id: adminUsers[1]?.id || adminUsers[0].id,
          approved_at: new Date(),
          download_count: 15,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Student Exchange Program Policy',
          description: 'Policy document outlining the procedures and requirements for international student exchange programs.',
          file_data: dummyPdfData,
          file_name: 'student_exchange_policy.pdf',
          mime_type: 'application/pdf',
          file_size: 189440,
          uploaded_by_id: adminUsers[1]?.id || adminUsers[0].id,
          university_body_id: universityBodies[1]?.id || universityBodies[0].id,
          is_public: false,
          approval_status: 'pending',
          requested_at: new Date(),
          download_count: 3,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Library Resource Allocation Plan',
          description: 'Annual plan for library resource allocation and budget distribution across different departments.',
          file_data: dummyPdfData,
          file_name: 'library_allocation_plan.pdf',
          mime_type: 'application/pdf',
          file_size: 312800,
          uploaded_by_id: adminUsers[2]?.id || adminUsers[0].id,
          university_body_id: universityBodies[2]?.id || universityBodies[0].id,
          is_public: true,
          approval_status: 'rejected',
          approved_by_id: adminUsers[0].id,
          approved_at: new Date(),
          rejection_reason: 'Budget allocations require revision based on current departmental needs assessment.',
          download_count: 8,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Annual Sports Championship Rules',
          description: 'Official rules and regulations for the annual inter-departmental sports championship.',
          file_data: dummyPdfData,
          file_name: 'sports_championship_rules.pdf',
          mime_type: 'application/pdf',
          file_size: 156200,
          uploaded_by_id: adminUsers[3]?.id || adminUsers[0].id,
          university_body_id: universityBodies[3]?.id || universityBodies[0].id,
          is_public: true,
          approval_status: 'pending',
          download_count: 0,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Alumni Networking Event Guidelines',
          description: 'Guidelines for organizing and conducting alumni networking events throughout the academic year.',
          file_data: dummyPdfData,
          file_name: 'alumni_networking_guidelines.pdf',
          mime_type: 'application/pdf',
          file_size: 178950,
          uploaded_by_id: adminUsers[4]?.id || adminUsers[0].id,
          university_body_id: universityBodies[4]?.id || universityBodies[0].id,
          is_public: false,
          approval_status: 'approved',
          approved_by_id: adminUsers[0].id,
          approved_at: new Date(),
          download_count: 22,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove the university bodies created by this seeder
    await queryInterface.bulkDelete('university_bodies', {
      name: [
        'Research and Development Board',
        'Alumni Affairs Committee',
        'International Relations Committee',
        'Library Advisory Board',
        'Sports and Recreation Committee'
      ]
    }, {});

    // Remove the documents created by this seeder
    await queryInterface.bulkDelete('documents', {
      title: [
        'Research Grant Application Guidelines 2025',
        'Student Exchange Program Policy',
        'Library Resource Allocation Plan',
        'Annual Sports Championship Rules',
        'Alumni Networking Event Guidelines'
      ]
    }, {});
  }
};