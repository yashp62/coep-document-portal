const express = require('express');
const { User } = require('../models');
const { 
  authenticateToken, 
  requireSuperAdmin 
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

/**
 * @swagger
 * /api/super-admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users in the system with pagination and filtering (Super Admin only)
 *     tags: [Super Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [super_admin, admin, sub_admin]
 *         description: Filter users by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         current:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

// @route   GET /api/super-admin/users
// @desc    Get all users (Super Admin)
// @access  Private (Super Admin)
router.get('/', authenticateToken, requireSuperAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { role, search } = req.query;

    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }

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

/**
 * @swagger
 * /api/super-admin/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with any role (Super Admin only)
 *     tags: [Super Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, sub_admin]
 *                 description: User's role in the system
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Email already exists
 */

// @route   POST /api/super-admin/users
// @desc    Create new user (Super Admin)
// @access  Private (Super Admin)
router.post('/', authenticateToken, requireSuperAdmin, validateUserCreation, async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, role = 'sub_admin' } = req.body;

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

    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      role,
      is_active: true
    });

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = user.toJSON();

    res.status(201).json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/super-admin/users/:id
// @desc    Update user (Super Admin)
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

    const { first_name, last_name, email, role, is_active, password } = req.body;

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
      email: email || user.email,
      role: role || user.role,
      is_active: is_active !== undefined ? is_active : user.is_active
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

// @route   DELETE /api/super-admin/users/:id
// @desc    Delete user (Super Admin)
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

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
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

// @route   PUT /api/super-admin/users/:id/toggle-status
// @desc    Toggle user active status (Super Admin)
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

    // Prevent deactivating yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    await user.update({
      is_active: !user.is_active
    });

    const { password_hash: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      success: true,
      data: { user: userWithoutPassword },
      message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;