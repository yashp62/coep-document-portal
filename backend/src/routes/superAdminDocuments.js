const express = require('express');
const { Document, User, UniversityBody } = require('../models');
const { 
  authenticateToken, 
  requireSuperAdmin 
} = require('../middleware/auth');
const { 
  validateDocumentCreation, 
  validateDocumentUpdate, 
  validateId, 
  validatePagination 
} = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/super-admin/documents
// @desc    Get all documents for super admin (all documents, all statuses)
// @access  Private (Super Admin)
router.get('/', authenticateToken, requireSuperAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, university_body_id, approval_status, only_mine, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

    // Super admin can see ALL documents regardless of status, unless only_mine is specified
    const whereClause = {};
    
    // If only_mine is true, filter by uploaded_by_id
    if (only_mine === 'true') {
      whereClause.uploaded_by_id = req.user.id;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (university_body_id) {
      whereClause.university_body_id = university_body_id;
    }

    if (approval_status) {
      whereClause.approval_status = approval_status;
    }

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'uploadedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      limit,
      offset,
      order: [[sort_by, sort_order.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalDocuments: count,
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/super-admin/documents
// @desc    Create new document (super admin)
// @access  Private (Super Admin)
router.post('/', 
  authenticateToken, 
  requireSuperAdmin,
  upload.single('file'),
  handleUploadError,
  validateDocumentCreation,
  async (req, res, next) => {
    try {
      const { title, description, university_body_id, is_public = false } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }

      const document = await Document.create({
        title,
        description,
        file_data: req.file.buffer,
        file_name: req.file.originalname,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        uploaded_by_id: req.user.id,
        university_body_id: university_body_id || null,
        is_public: is_public,
        approval_status: 'approved', // Super admin documents auto-approved
        approved_by_id: req.user.id,
        approved_at: new Date()
      });

      const documentWithDetails = await Document.findByPk(document.id, {
        include: [
          {
            model: UniversityBody,
            as: 'universityBody',
            attributes: ['id', 'name', 'type']
          },
          {
            model: User,
            as: 'uploadedBy',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: { document: documentWithDetails },
        message: 'Document uploaded and approved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/super-admin/documents/:id/approve
// @desc    Approve a document (super admin)
// @access  Private (Super Admin)
router.put('/:id/approve', authenticateToken, requireSuperAdmin, validateId, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await document.update({
      approval_status: 'approved',
      approved_by_id: req.user.id,
      approved_at: new Date(),
      rejection_reason: null
    });

    res.json({
      success: true,
      data: { document },
      message: 'Document approved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/super-admin/documents/:id/reject
// @desc    Reject a document (super admin)
// @access  Private (Super Admin)
router.put('/:id/reject', authenticateToken, requireSuperAdmin, validateId, async (req, res, next) => {
  try {
    const { rejection_reason } = req.body;
    
    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await document.update({
      approval_status: 'rejected',
      approved_by_id: req.user.id,
      approved_at: new Date(),
      rejection_reason
    });

    res.json({
      success: true,
      data: { document },
      message: 'Document rejected successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/super-admin/documents/:id
// @desc    Delete document (super admin - no time restrictions)
// @access  Private (Super Admin)
router.delete('/:id', authenticateToken, requireSuperAdmin, validateId, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await document.destroy();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;