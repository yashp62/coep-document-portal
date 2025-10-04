const express = require('express');
const { User } = require('../models');
const { 
  authenticateToken, 
  requireAdmin 
} = require('../middleware/auth');
const { 
  validateUserCreation, 
  validateUserUpdate, 
  validateId, 
  validatePagination 
} = require('../middleware/validation');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get users (Admin - limited view)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search } = req.query;

    // Admin can see sub_admin and other admin users, but not super_admin
    const whereClause = {
      role: { [Op.in]: ['admin', 'sub_admin'] },
      is_active: true
    };
    
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password_hash'] },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/users
// @desc    Create new sub-admin user (Admin)
// @access  Private (Admin)
router.post('/', authenticateToken, requireAdmin, validateUserCreation, async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Admin can only create sub_admin users
    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      role: 'sub_admin',
      is_active: true
    });

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = user.toJSON();

    res.status(201).json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'Sub-admin user created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user (Admin)
// @access  Private (Admin)
router.get('/:id', authenticateToken, requireAdmin, validateId, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { 
        id: req.params.id,
        role: { [Op.in]: ['admin', 'sub_admin'] },
        is_active: true
      },
      attributes: { exclude: ['password_hash'] }
    });

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

// @route   PUT /api/admin/users/:id
// @desc    Update user (Admin - limited permissions)
// @access  Private (Admin)
router.put('/:id', authenticateToken, requireAdmin, validateId, validateUserUpdate, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { 
        id: req.params.id,
        role: { [Op.in]: ['admin', 'sub_admin'] }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Admin can only update sub_admin users or their own profile
    if (user.role === 'admin' && user.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update sub-admin users or your own profile'
      });
    }

    const { first_name, last_name, email, password } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const updateData = {
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      email: email || user.email
    };

    // Hash new password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    await user.update(updateData);

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;