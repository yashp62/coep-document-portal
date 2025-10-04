'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create university_bodies table
    await queryInterface.createTable('university_bodies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Board', 'Committee', 'Council', 'Department', 'Office', 'Other'),
        allowNull: false,
        defaultValue: 'Other'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      director_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('university_bodies', ['name'], { unique: true });
    await queryInterface.addIndex('university_bodies', ['type']);
    await queryInterface.addIndex('university_bodies', ['director_id']);
    await queryInterface.addIndex('university_bodies', ['is_active']);

    // Insert some default university bodies
    await queryInterface.bulkInsert('university_bodies', [
      {
        name: 'Academic Council',
        type: 'Committee',
        description: 'Committee responsible for academic policies and curriculum development.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Board of Studies',
        type: 'Committee',
        description: 'Committee overseeing course structures and syllabus design.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Examinations and Evaluations',
        type: 'Board',
        description: 'Board responsible for examination policies and evaluation methods.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Student Development',
        type: 'Board',
        description: 'Board focused on student welfare and development programs.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Research & Development',
        type: 'Board',
        description: 'Board overseeing research initiatives and innovation projects.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Alumni Affairs',
        type: 'Board',
        description: 'Board managing alumni relations and networking events.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('university_bodies');
  }
};
