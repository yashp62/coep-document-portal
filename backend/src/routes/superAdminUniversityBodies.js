const express = require('express');
const { UniversityBody, User } = require('../models');
const { 
  authenticateToken, 
  requireSuperAdmin
} = require('../middleware/auth');
const { 
  validateId, 
  validatePagination 
} = require('../middleware/validation');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/super-admin/university-bodies
// @desc    Get all university bodies (super admin)
// @access  Private (Super Admin)
router.get('/', authenticateToken, requireSuperAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, type, is_active } = req.query;

    // Super admin can see all university bodies regardless of status
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

    if (is_active !== undefined && is_active !== 'all') {
      whereClause.is_active = is_active === 'true';
    }

    const { count, rows: universityBodies } = await UniversityBody.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
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

// @route   POST /api/super-admin/university-bodies
// @desc    Create new university body (super admin)
// @access  Private (Super Admin)
router.post('/', authenticateToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, type, description, admin_id } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }

    // Validate admin_id if provided
    if (admin_id) {
      const adminUser = await User.findByPk(admin_id);
      if (!adminUser) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin user ID'
        });
      }
      
      if (!['admin', 'super_admin'].includes(adminUser.role)) {
        return res.status(400).json({
          success: false,
          message: 'Selected user must be an admin or super admin'
        });
      }
    }

    const universityBody = await UniversityBody.create({
      name,
      type,
      description,
      admin_id,
      is_active: true
    });

    const universityBodyWithAdmin = await UniversityBody.findByPk(universityBody.id, {
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
      data: { universityBody: universityBodyWithAdmin },
      message: 'University body created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/super-admin/university-bodies/:id
// @desc    Update university body (super admin)
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

    // Validate admin_id if provided
    if (admin_id) {
      const adminUser = await User.findByPk(admin_id);
      if (!adminUser) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin user ID'
        });
      }
      
      if (!['admin', 'super_admin'].includes(adminUser.role)) {
        return res.status(400).json({
          success: false,
          message: 'Selected user must be an admin or super admin'
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

    const updatedUniversityBody = await UniversityBody.findByPk(universityBody.id, {
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
      data: { universityBody: updatedUniversityBody },
      message: 'University body updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/super-admin/university-bodies/:id
// @desc    Delete university body (super admin)
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

module.exports = router;