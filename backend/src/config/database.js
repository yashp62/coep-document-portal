const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine database dialect based on environment
const isProduction = process.env.NODE_ENV === 'production';
const dialect = isProduction ? 'postgres' : 'mysql';
const defaultPort = isProduction ? 5432 : 3306;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'dashboard',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || defaultPort,
    dialect: dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {
      charset: 'utf8mb4'
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

module.exports = { sequelize };
