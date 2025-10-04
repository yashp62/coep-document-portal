const express = require('express');
const { User } = require('../models');
const { 
  authenticateToken, 
  requireSuperAdmin, 
  requireAdmin 
} = require('../middleware/auth');
const { 
  validateUserCreation, 
  validateUserUpdate, 
  validateId, 
  validatePagination 
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Super Admin only)
// @access  Private (Super Admin)
router.get('/', authenticateToken, requireSuperAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
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

// @route   GET /api/users/:id
// @desc    Get user by ID (Super Admin only)
// @access  Private (Super Admin)
router.get('/:id', authenticateToken, requireSuperAdmin, validateId, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
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

// @route   POST /api/users
// @desc    Create new user (Super Admin only)
// @access  Private (Super Admin)
router.post('/', authenticateToken, requireSuperAdmin, validateUserCreation, async (req, res, next) => {
  try {
    const { email, password, role, first_name, last_name, designation, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = await User.create({
      email,
      password_hash: password, // Will be hashed by the model hook
      role,
      first_name,
      last_name,
      designation,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          designation: user.designation,
          phone: user.phone,
          is_active: user.is_active,
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id', authenticateToken, requireSuperAdmin, validateId, validateUserUpdate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: req.body.email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Prevent Super Admin from changing their own role
    if (req.body.role && user.id === req.user.id && req.body.role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    await user.update(req.body);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          designation: user.designation,
          phone: user.phone,
          is_active: user.is_active,
          updated_at: user.updated_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Super Admin only)
// @access  Private (Super Admin)
router.delete('/:id', authenticateToken, requireSuperAdmin, validateId, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent Super Admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id/toggle-status
// @desc    Toggle user active status (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id/toggle-status', authenticateToken, requireSuperAdmin, validateId, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent Super Admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    await user.update({ is_active: !user.is_active });

    res.json({
      success: true,
      message: `User ${user.is_active ? 'deactivated' : 'activated'} successfully`,
      data: {
        user: {
          id: user.id,
          email: user.email,
          is_active: user.is_active
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
