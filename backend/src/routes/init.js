const express = require('express');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const { exec } = require('child_process');
const path = require('path');

const router = express.Router();

// @route   POST /api/init/migrate
// @desc    Run database migrations
// @access  Public (one-time use)
router.post('/migrate', async (req, res) => {
  try {
    // Run migrations using sequelize-cli
    const migrationCommand = 'npx sequelize-cli db:migrate';
    
    exec(migrationCommand, { cwd: path.join(__dirname, '../../') }, (error, stdout, stderr) => {
      if (error) {
        console.error('Migration error:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Migration failed', 
          details: error.message,
          stderr: stderr 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Migrations completed successfully',
        output: stdout 
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to run migrations', 
      details: error.message 
    });
  }
});

// @route   POST /api/init
// @desc    Initialize database with demo data (for production)
// @access  Public (one-time use)
router.post('/', async (req, res) => {
  try {
    // Check if users table exists
    try {
      await sequelize.query('SELECT 1 FROM users LIMIT 1');
    } catch (tableError) {
      return res.status(400).json({ 
        success: false,
        error: 'Tables not found. Please run migrations first.',
        suggestion: 'POST to /api/init/migrate first'
      });
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
      ('superadmin@coep.ac.in', '${hashedSuperAdminPassword}', 'super_admin', 'System', 'Super Admin', 'System Administrator', NULL, 1, NOW(), NOW()),
      ('admin@coep.ac.in', '${hashedAdminPassword}', 'admin', 'Dr. Admin', 'User', 'Administrator', NULL, 1, NOW(), NOW()),
      ('subadmin@coep.ac.in', '${hashedAdminPassword}', 'sub_admin', 'Sub Admin', 'User', 'Assistant Administrator', NULL, 1, NOW(), NOW())
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
      WHERE table_schema = 'public' AND table_name IN ('users', 'categories', 'university_bodies')
    `);
    
    if (tables[0].length < 3) {
      return res.json({
        initialized: false,
        tablesExist: false,
        foundTables: tables[0].map(t => t.table_name),
        message: 'Database tables not found. Run migrations first.'
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
      suggestion: 'Database tables might not exist. Try running migrations first.'
    });
  }
});

module.exports = router;