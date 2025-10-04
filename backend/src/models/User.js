const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'sub_admin'),
    allowNull: false,
    defaultValue: 'sub_admin'
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'first_name'
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'last_name'
  },
  designation: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
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
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  last_login: {
    type: DataTypes.DATE,
    field: 'last_login'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  return values;
};

module.exports = User;
