const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_data: {
    type: DataTypes.BLOB('long'),
    allowNull: false,
    field: 'file_data'
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'file_name'
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'mime_type'
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'file_size'
  },
  uploaded_by_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'uploaded_by_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  university_body_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'university_body_id',
    references: {
      model: 'university_bodies',
      key: 'id'
    }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  },
  approval_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'approval_status'
  },
  approved_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'approved_by_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at'
  },
  requested_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'requested_at'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'download_count'
  }
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['uploaded_by_id']
    },
    {
      fields: ['title']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Document;
