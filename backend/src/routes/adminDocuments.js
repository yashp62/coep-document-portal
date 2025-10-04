const express = require('express');
const { Document, User, UniversityBody } = require('../models');
const { 
  authenticateToken, 
  requireAdmin 
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

// @route   GET /api/admin/documents
// @desc    Get documents for admin (documents in their university bodies + public approved)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, university_body_id, approval_status, only_university_body, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

    // Get admin's university body
    const adminUser = await User.findByPk(req.user.id, {
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
      // For "My Documents" - only show documents from admin's university body
      whereClause = {
        university_body_id: adminUser.universityBody?.id
      };
    } else {
      // For "All Documents" - show university body documents + public approved documents
      whereClause = {
        [Op.or]: [
          { 
            university_body_id: adminUser.universityBody?.id // All documents from their university body
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

// @route   GET /api/admin/documents/pending
// @desc    Get pending documents for admin approval (from same university body)
// @access  Private (Admin)
router.get('/pending', authenticateToken, requireAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

    // Get admin's university body to find documents that need approval
    const adminUser = await User.findByPk(req.user.id, {
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    if (!adminUser || !adminUser.universityBody) {
      return res.status(400).json({
        success: false,
        message: 'Admin must be associated with a university body to approve documents'
      });
    }

    // Find pending documents from the same university body
    const whereClause = {
      approval_status: 'pending',
      university_body_id: adminUser.universityBody.id
    };
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
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
          attributes: ['id', 'first_name', 'last_name', 'email', 'role']
        }
      ],
      attributes: { exclude: ['file_data'] }, // Exclude large binary data
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

// @route   POST /api/admin/documents/:id/approve
// @desc    Approve a pending document (Admin only, same university body)
// @access  Private (Admin)
router.post('/:id/approve', authenticateToken, requireAdmin, validateId, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'uploadedBy',
          attributes: ['id', 'first_name', 'last_name', 'email', 'role']
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.approval_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Document is not pending approval'
      });
    }

    // Get admin's university body
    const adminUser = await User.findByPk(req.user.id, {
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    // Check if admin is from the same university body
    if (!adminUser.universityBody || adminUser.universityBody.id !== document.university_body_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve documents from your university body'
      });
    }

    // Update document to approved
    await document.update({
      approval_status: 'approved',
      is_public: true,
      approved_by_id: req.user.id,
      approved_at: new Date()
    });

    res.json({
      success: true,
      message: 'Document approved successfully',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/documents/:id/reject
// @desc    Reject a pending document (Admin only, same university body)
// @access  Private (Admin)
router.post('/:id/reject', authenticateToken, requireAdmin, validateId, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'uploadedBy',
          attributes: ['id', 'first_name', 'last_name', 'email', 'role']
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.approval_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Document is not pending approval'
      });
    }

    // Get admin's university body
    const adminUser = await User.findByPk(req.user.id, {
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    // Check if admin is from the same university body
    if (!adminUser.universityBody || adminUser.universityBody.id !== document.university_body_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject documents from your university body'
      });
    }

    // Update document to rejected
    await document.update({
      approval_status: 'rejected',
      approved_by_id: req.user.id,
      approved_at: new Date(),
      rejection_reason: reason || 'No reason provided'
    });

    res.json({
      success: true,
      message: 'Document rejected',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/documents
// @desc    Create new document (admin) - auto-approved
// @access  Private (Admin)
router.post('/', 
  authenticateToken, 
  requireAdmin,
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

      // Get admin's university body
      const adminUser = await User.findByPk(req.user.id, {
        include: [
          {
            model: UniversityBody,
            as: 'universityBody',
            attributes: ['id', 'name', 'type']
          }
        ]
      });

      if (!adminUser || !adminUser.universityBody) {
        return res.status(400).json({
          success: false,
          message: 'Admin must be associated with a university body to upload documents'
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
        university_body_id: university_body_id || adminUser.universityBody.id, // Use provided or admin's university body
        is_public: is_public,
        approval_status: 'approved', // Admin documents auto-approved
        approved_by_id: req.user.id, // Self-approved
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
        message: 'Document uploaded successfully. Pending approval.'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/admin/documents/:id
// @desc    Update document (admin - own documents only, within 24 hours if approved)
// @access  Private (Admin)
router.put('/:id', 
  authenticateToken, 
  requireAdmin,
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

      // Admin can only update their own documents
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

// @route   DELETE /api/admin/documents/:id
// @desc    Delete document (admin - own documents, within 24 hours)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Admin can only delete their own documents
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