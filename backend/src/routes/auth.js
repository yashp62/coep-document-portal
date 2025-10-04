const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, UniversityBody } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { sequelize } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials or account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          last_login: user.last_login
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (client-side token invalidation)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticateToken, (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // In a more secure implementation, you might maintain a token blacklist
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    // Start with basic user query
    const userQuery = {
      attributes: { exclude: ['password_hash'] }
    };

    // Add university body association if the column exists
    const userAttributes = Object.keys(User.rawAttributes);
    if (userAttributes.includes('university_body_id')) {
      userQuery.include = [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type'],
          required: false // LEFT JOIN to handle null values
        }
      ];
    }

    const user = await User.findByPk(req.user.id, userQuery);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Public
router.post('/verify-token', (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        userId: decoded.userId,
        role: decoded.role,
        exp: decoded.exp
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    next(error);
  }
});

// Temporary init endpoint for emergency database setup
router.post('/init-db', async (req, res) => {
  try {
    // Create tables
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

    // Check if data already exists
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
      message: 'Database initialized successfully via emergency route',
      users: 3,
      categories: 4,
      universityBodies: 4
    });

  } catch (error) {
    console.error('Emergency DB init error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to initialize database',
      details: error.message 
    });
  }
});

module.exports = router;
