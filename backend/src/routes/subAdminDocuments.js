const express = require('express');
const { Document, User, UniversityBody } = require('../models');
const { 
  authenticateToken, 
  requireSubAdmin 
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

// @route   GET /api/sub-admin/documents
// @desc    Get documents for sub-admin (only their own + public approved)
// @access  Private (Sub Admin)
router.get('/', authenticateToken, requireSubAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, university_body_id, approval_status, only_university_body, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

    // Get sub-admin's university body
    const subAdminUser = await User.findByPk(req.user.id, {
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    let whereClause;
    
    if (only_university_body === 'true') {
      // For "My Documents" - only show documents from sub-admin's university body
      whereClause = {
        university_body_id: subAdminUser.universityBody?.id
      };
    } else {
      // For "All Documents" - show university body documents + public approved documents
      whereClause = {
        [Op.or]: [
          { 
            university_body_id: subAdminUser.universityBody?.id // All documents from their university body
          },
          {
            is_public: true,
            approval_status: 'approved' // Public approved documents from other bodies
          }
        ]
      };
    }
    
    if (search) {
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      });
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

// @route   POST /api/sub-admin/documents
// @desc    Create new document (sub-admin)
// @access  Private (Sub Admin)
router.post('/', 
  authenticateToken, 
  requireSubAdmin,
  upload.single('file'),
  handleUploadError,
  validateDocumentCreation,
  async (req, res, next) => {
    try {
      const { title, description } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }

      // Get sub-admin's university body
      const subAdminUser = await User.findByPk(req.user.id, {
        include: [
          {
            model: UniversityBody,
            as: 'universityBody',
            attributes: ['id', 'name', 'type']
          }
        ]
      });

      if (!subAdminUser || !subAdminUser.universityBody) {
        return res.status(400).json({
          success: false,
          message: 'Sub-admin must be associated with a university body to upload documents'
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
        university_body_id: subAdminUser.universityBody.id, // Use sub-admin's university body
        is_public: false, // Not public until approved
        approval_status: 'pending', // Sub-admin documents need approval
        requested_at: new Date()
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
        ],
        attributes: { exclude: ['file_data'] } // Exclude large binary data from response
      });

      res.status(201).json({
        success: true,
        data: { document: documentWithDetails },
        message: 'Document uploaded successfully. Pending approval from your university body admin.'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/sub-admin/documents/:id
// @desc    Update document (sub-admin - own documents only, within 24 hours if approved)
// @access  Private (Sub Admin)
router.put('/:id', 
  authenticateToken, 
  requireSubAdmin,
  validateId,
  validateDocumentUpdate,
  async (req, res, next) => {
    try {
      const document = await Document.findByPk(req.params.id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Sub-admin can only update their own documents
      if (document.uploaded_by_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own documents'
        });
      }

      // Check 24-hour rule for approved documents
      if (document.approval_status === 'approved') {
        const now = new Date();
        const uploadTime = new Date(document.created_at);
        const hoursDiff = (now - uploadTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          return res.status(403).json({
            success: false,
            message: 'Cannot update document after 24 hours of approval'
          });
        }
      }

      const { title, description, university_body_id, is_public } = req.body;
      
      await document.update({
        title: title || document.title,
        description: description || document.description,
        university_body_id: university_body_id !== undefined ? university_body_id : document.university_body_id,
        is_public: is_public !== undefined ? is_public : document.is_public
      });

      const updatedDocument = await Document.findByPk(document.id, {
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

      res.json({
        success: true,
        data: { document: updatedDocument },
        message: 'Document updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/sub-admin/documents/:id
// @desc    Delete document (sub-admin - own documents, within 24 hours)
// @access  Private (Sub Admin)
router.delete('/:id', authenticateToken, requireSubAdmin, validateId, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Sub-admin can only delete their own documents
    if (document.uploaded_by_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own documents'
      });
    }

    // Check 24-hour rule
    const now = new Date();
    const uploadTime = new Date(document.created_at);
    const hoursDiff = (now - uploadTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete document after 24 hours of upload'
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