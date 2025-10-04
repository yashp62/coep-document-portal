const express = require('express');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const router = express.Router();

// @route   POST /api/init
// @desc    Initialize database with demo data (for production)
// @access  Public (one-time use)
router.post('/init', async (req, res) => {
  try {
    // Check if users already exist
    const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count > 0) {
      return res.json({ message: 'Database already initialized', users: users[0].count });
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
      message: 'Database initialized successfully',
      users: 3,
      categories: 4,
      universityBodies: 4
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
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
    const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    const [categories] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
    const [universityBodies] = await sequelize.query('SELECT COUNT(*) as count FROM university_bodies');

    res.json({
      initialized: users[0].count > 0,
      users: users[0].count,
      categories: categories[0].count,
      universityBodies: universityBodies[0].count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status', details: error.message });
  }
});

module.exports = router;