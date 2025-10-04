const express = require('express');
const { UniversityBody, User } = require('../models');
const { 
  authenticateToken, 
  requireSuperAdmin,
  requireAdmin
} = require('../middleware/auth');
const { 
  validateId, 
  validatePagination 
} = require('../middleware/validation');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/university-bodies
// @desc    Get all university bodies
// @access  Public
router.get('/', validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, type, is_active = 'true' } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (type) {
      whereClause.type = type;
    }

    if (is_active !== 'all') {
      whereClause.is_active = is_active === 'true';
    }

        const { count, rows: universityBodies } = await UniversityBody.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'admin', // Updated to use new association alias
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      attributes: { exclude: [] },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        universityBodies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalBodies: count,
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/university-bodies/:id
// @desc    Get university body by ID
// @access  Public
router.get('/:id', validateId, async (req, res, next) => {
  try {
    const universityBody = await UniversityBody.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'director',
          attributes: ['id', 'first_name', 'last_name', 'email', 'designation']
        }
      ]
    });

    if (!universityBody) {
      return res.status(404).json({
        success: false,
        message: 'University body not found'
      });
    }

    res.json({
      success: true,
      data: { universityBody }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/university-bodies
// @desc    Create new university body (Super Admin only)
// @access  Private (Super Admin)
router.post('/', authenticateToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, type, description, admin_id, is_active } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }

    // Check if name already exists
    const existingBody = await UniversityBody.findOne({ where: { name } });
    if (existingBody) {
      return res.status(400).json({
        success: false,
        message: 'University body with this name already exists'
      });
    }

    // Verify admin exists if specified
    if (admin_id) {
      const admin = await User.findByPk(admin_id);
      if (!admin) {
        return res.status(400).json({
          success: false,
          message: 'Admin not found'
        });
      }
    }

    const universityBody = await UniversityBody.create({
      name,
      type,
      description,
      admin_id,
      is_active: is_active !== undefined ? is_active : true
    });

    // Fetch the created body with associations
    const createdBody = await UniversityBody.findByPk(universityBody.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'University body created successfully',
      data: { universityBody: createdBody }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/university-bodies/:id
// @desc    Update university body (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id', authenticateToken, requireSuperAdmin, validateId, async (req, res, next) => {
  try {
    const universityBody = await UniversityBody.findByPk(req.params.id);

    if (!universityBody) {
      return res.status(404).json({
        success: false,
        message: 'University body not found'
      });
    }

    const { name, type, description, admin_id, is_active } = req.body;

    // Check if name already exists (excluding current body)
    if (name && name !== universityBody.name) {
      const existingBody = await UniversityBody.findOne({ 
        where: { 
          name,
          id: { [Op.ne]: req.params.id }
        } 
      });
      if (existingBody) {
        return res.status(400).json({
          success: false,
          message: 'University body with this name already exists'
        });
      }
    }

    // Verify admin exists if specified
    if (admin_id) {
      const admin = await User.findByPk(admin_id);
      if (!admin) {
        return res.status(400).json({
          success: false,
          message: 'Admin not found'
        });
      }
    }

    await universityBody.update({
      name: name || universityBody.name,
      type: type || universityBody.type,
      description: description !== undefined ? description : universityBody.description,
      admin_id: admin_id !== undefined ? admin_id : universityBody.admin_id,
      is_active: is_active !== undefined ? is_active : universityBody.is_active
    });

    // Fetch updated body with associations
    const updatedBody = await UniversityBody.findByPk(universityBody.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'University body updated successfully',
      data: { universityBody: updatedBody }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/university-bodies/:id
// @desc    Delete university body (Super Admin only)
// @access  Private (Super Admin)
router.delete('/:id', authenticateToken, requireSuperAdmin, validateId, async (req, res, next) => {
  try {
    const universityBody = await UniversityBody.findByPk(req.params.id);

    if (!universityBody) {
      return res.status(404).json({
        success: false,
        message: 'University body not found'
      });
    }

    await universityBody.destroy();

    res.json({
      success: true,
      message: 'University body deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/university-bodies/types
// @desc    Get available university body types
// @access  Public
router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: {
      types: ['Board', 'Committee', 'Council', 'Department', 'Office', 'Other']
    }
  });
});

module.exports = router;