const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UniversityBody = sequelize.define('UniversityBody', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  type: {
    type: DataTypes.ENUM('Board', 'Committee', 'Council', 'Department', 'Office', 'Other'),
    allowNull: false,
    defaultValue: 'Other'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'admin_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'university_bodies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['name'],
      unique: true
    },
    {
      fields: ['type']
    },
    {
      fields: ['director_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = UniversityBody;