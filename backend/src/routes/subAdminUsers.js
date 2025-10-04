const express = require('express');
const { User } = require('../models');
const { 
  authenticateToken, 
  requireSubAdmin 
} = require('../middleware/auth');
const { 
  validateUserUpdate, 
  validateId, 
  validatePagination 
} = require('../middleware/validation');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/sub-admin/users
// @desc    Get users (Sub Admin - very limited view)
// @access  Private (Sub Admin)
router.get('/', authenticateToken, requireSubAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search } = req.query;

    // Sub-admin can only see other sub_admin users (for collaboration purposes)
    const whereClause = {
      role: 'sub_admin',
      is_active: true,
      id: { [Op.ne]: req.user.id } // Exclude themselves from the list
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
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'created_at'], // Limited attributes
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

// @route   GET /api/sub-admin/users/profile
// @desc    Get own profile (Sub Admin)
// @access  Private (Sub Admin)
router.get('/profile', authenticateToken, requireSubAdmin, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
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

// @route   PUT /api/sub-admin/users/profile
// @desc    Update own profile (Sub Admin)
// @access  Private (Sub Admin)
router.put('/profile', authenticateToken, requireSubAdmin, validateUserUpdate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/sub-admin/users/:id
// @desc    Get single user (Sub Admin - very limited)
// @access  Private (Sub Admin)
router.get('/:id', authenticateToken, requireSubAdmin, validateId, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { 
        id: req.params.id,
        role: 'sub_admin',
        is_active: true
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'created_at'] // Limited attributes
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

module.exports = router;