const express = require('express');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const router = express.Router();

// @route   POST /api/init/create-tables
// @desc    Create database tables if they don't exist
// @access  Public (one-time use)
router.post('/create-tables', async (req, res) => {
  try {
    // Create tables manually using SQL
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS university_bodies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) CHECK (type IN ('board', 'committee')),
        description TEXT,
        admin_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK (role IN ('super_admin', 'admin', 'sub_admin')) DEFAULT 'sub_admin',
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        designation VARCHAR(255),
        university_body_id INTEGER REFERENCES university_bodies(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        university_body_id INTEGER REFERENCES university_bodies(id) ON DELETE SET NULL,
        status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        is_public BOOLEAN DEFAULT false,
        version VARCHAR(50) DEFAULT '1.0',
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    res.json({ 
      success: true,
      message: 'Database tables created successfully'
    });

  } catch (error) {
    console.error('Table creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create tables',
      details: error.message 
    });
  }
});

// @route   POST /api/init
// @desc    Initialize database with demo data (for production)
// @access  Public (one-time use)
router.post('/', async (req, res) => {
  try {
    // First, try to create tables if they don't exist
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS university_bodies (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) CHECK (type IN ('board', 'committee')),
          description TEXT,
          admin_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) CHECK (role IN ('super_admin', 'admin', 'sub_admin')) DEFAULT 'sub_admin',
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          designation VARCHAR(255),
          university_body_id INTEGER REFERENCES university_bodies(id) ON DELETE SET NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER,
          mime_type VARCHAR(100),
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          university_body_id INTEGER REFERENCES university_bodies(id) ON DELETE SET NULL,
          status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
          approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          approved_at TIMESTAMP,
          is_public BOOLEAN DEFAULT false,
          version VARCHAR(50) DEFAULT '1.0',
          tags TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (tableError) {
      console.log('Table creation warning:', tableError.message);
    }

    // Check if users already exist
    const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count > 0) {
      return res.json({ 
        success: true,
        message: 'Database already initialized', 
        users: users[0].count 
      });
    }

    // Create demo data
    const saltRounds = 12;
    const hashedAdminPassword = await bcrypt.hash('admin123', saltRounds);
    const hashedSuperAdminPassword = await bcrypt.hash('superadmin123', saltRounds);

    // Create categories
    await sequelize.query(`
      INSERT INTO categories (name, description, created_at, updated_at) VALUES 
      ('Academic', 'Academic related documents', NOW(), NOW()),
      ('Administrative', 'Administrative documents', NOW(), NOW()),
      ('Financial', 'Financial documents', NOW(), NOW()),
      ('General', 'General documents', NOW(), NOW())
    `);

    // Create university bodies
    await sequelize.query(`
      INSERT INTO university_bodies (name, type, description, admin_id, created_at, updated_at) VALUES 
      ('Academic Council', 'board', 'Main academic governing body', NULL, NOW(), NOW()),
      ('Finance Committee', 'committee', 'Financial oversight committee', NULL, NOW(), NOW()),
      ('Student Development Board', 'board', 'Student affairs and development', NULL, NOW(), NOW()),
      ('Examination Board', 'board', 'Examination and evaluation oversight', NULL, NOW(), NOW())
    `);

    // Create users
    await sequelize.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, designation, university_body_id, is_active, created_at, updated_at) VALUES 
      ('superadmin@coep.ac.in', '${hashedSuperAdminPassword}', 'super_admin', 'System', 'Super Admin', 'System Administrator', NULL, true, NOW(), NOW()),
      ('admin@coep.ac.in', '${hashedAdminPassword}', 'admin', 'Dr. Admin', 'User', 'Administrator', NULL, true, NOW(), NOW()),
      ('subadmin@coep.ac.in', '${hashedAdminPassword}', 'sub_admin', 'Sub Admin', 'User', 'Assistant Administrator', NULL, true, NOW(), NOW())
    `);

    res.json({ 
      success: true,
      message: 'Database initialized successfully',
      users: 3,
      categories: 4,
      universityBodies: 4
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to initialize database',
      details: error.message 
    });
  }
});

// @route   GET /api/init/status
// @desc    Check initialization status
// @access  Public
router.get('/status', async (req, res) => {
  try {
    // Check if tables exist
    const tables = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'categories', 'university_bodies', 'documents')
    `);
    
    if (tables[0].length < 4) {
      return res.json({
        initialized: false,
        tablesExist: false,
        foundTables: tables[0].map(t => t.table_name),
        message: 'Database tables not found. Create tables first.',
        suggestion: 'POST to /api/init/create-tables'
      });
    }

    const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    const [categories] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
    const [universityBodies] = await sequelize.query('SELECT COUNT(*) as count FROM university_bodies');

    res.json({
      initialized: users[0].count > 0,
      tablesExist: true,
      users: users[0].count,
      categories: categories[0].count,
      universityBodies: universityBodies[0].count
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to check status', 
      details: error.message,
      suggestion: 'Database tables might not exist. Try creating tables first.'
    });
  }
});

module.exports = router;