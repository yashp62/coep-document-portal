'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      file_data: {
        type: Sequelize.BLOB('long'),
        allowNull: false,
        field: 'file_data'
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'file_name'
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'mime_type'
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'file_size'
      },
      uploaded_by_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'uploaded_by_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      university_body_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'university_body_id',
        references: {
          model: 'university_bodies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_public'
      },
      download_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'download_count'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('documents', ['uploaded_by_id']);
    await queryInterface.addIndex('documents', ['university_body_id']);
    await queryInterface.addIndex('documents', ['title']);
    await queryInterface.addIndex('documents', ['created_at']);
    await queryInterface.addIndex('documents', ['is_public']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documents');
  }
};
