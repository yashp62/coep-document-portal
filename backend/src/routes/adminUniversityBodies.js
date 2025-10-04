const express = require('express');
const { UniversityBody, User } = require('../models');
const { 
  authenticateToken, 
  requireAdmin
} = require('../middleware/auth');
const { 
  validateId, 
  validatePagination 
} = require('../middleware/validation');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/admin/university-bodies
// @desc    Get university bodies for admin (active only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, type } = req.query;

    // Admin can see active university bodies
    const whereClause = { is_active: true };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (type) {
      whereClause.type = type;
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

// @route   GET /api/admin/university-bodies/:id
// @desc    Get single university body (admin)
// @access  Private (Admin)
router.get('/:id', authenticateToken, requireAdmin, validateId, async (req, res, next) => {
  try {
    const universityBody = await UniversityBody.findOne({
      where: { 
        id: req.params.id,
        is_active: true 
      },
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'first_name', 'last_name', 'email']
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

// @route   PUT /api/admin/university-bodies/:id
// @desc    Update university body (admin - limited permissions)
// @access  Private (Admin)
router.put('/:id', authenticateToken, requireAdmin, validateId, async (req, res, next) => {
  try {
    const universityBody = await UniversityBody.findOne({
      where: { 
        id: req.params.id,
        is_active: true 
      }
    });
    
    if (!universityBody) {
      return res.status(404).json({
        success: false,
        message: 'University body not found'
      });
    }

    // Admin can only update description (limited permissions)
    const { description } = req.body;

    await universityBody.update({
      description: description !== undefined ? description : universityBody.description
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

module.exports = router;