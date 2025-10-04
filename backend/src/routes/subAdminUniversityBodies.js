const express = require('express');
const { UniversityBody, User } = require('../models');
const { 
  authenticateToken, 
  requireSubAdmin
} = require('../middleware/auth');
const { 
  validateId, 
  validatePagination 
} = require('../middleware/validation');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/sub-admin/university-bodies
// @desc    Get university bodies for sub-admin (active only, read-only)
// @access  Private (Sub Admin)
router.get('/', authenticateToken, requireSubAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, type } = req.query;

    // Sub-admin can see active university bodies (read-only)
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

// @route   GET /api/sub-admin/university-bodies/:id
// @desc    Get single university body (sub-admin, read-only)
// @access  Private (Sub Admin)
router.get('/:id', authenticateToken, requireSubAdmin, validateId, async (req, res, next) => {
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

module.exports = router;