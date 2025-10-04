const express = require('express');
const { Document, User, UniversityBody } = require('../models');
const { 
  authenticateToken, 
  requireAdmin, 
  requireSubAdmin,
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

// @route   GET /api/documents
// @desc    Get all documents with search and filter (public access)
// @access  Public
router.get('/', validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, university_body_id, document_type, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

    // Build where clause - handle backwards compatibility
    const whereClause = { is_public: true };
    
    // Only add approval_status if the field exists in the database
    // This allows the app to work before migrations are run
    const documentAttributes = Object.keys(Document.rawAttributes);
    if (documentAttributes.includes('approval_status')) {
      whereClause.approval_status = 'approved';
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

    if (document_type) {
      whereClause.document_type = document_type;
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
      attributes: { exclude: ['file_data'] }, // Exclude file data for list view
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

// @route   GET /api/documents/admin/all
// @desc    Get all documents for admin view (shows both public and private)
// @access  Private (Admin/Super Admin)
router.get('/admin/all', authenticateToken, requireAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, university_body_id, document_type, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

    // Build where clause - NO is_public filter for admin view
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (university_body_id) {
      whereClause.university_body_id = university_body_id;
    }

    if (document_type) {
      whereClause.document_type = document_type;
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
      attributes: { exclude: ['file_data'] }, // Exclude file data for list view
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

// @route   GET /api/documents/my-documents
// @desc    Get current user's uploaded documents (Admin/Sub-admin only)
// @access  Private (Admin/Sub-admin/Super Admin)
router.get('/my-documents', authenticateToken, requireSubAdmin, validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, university_body_id, document_type, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

    // Build where clause
    const whereClause = { uploaded_by_id: req.user.id };
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (university_body_id) {
      whereClause.university_body_id = university_body_id;
    }

    if (document_type) {
      whereClause.document_type = document_type;
    }

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        }
      ],
      attributes: { exclude: ['file_data'] },
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

// @route   GET /api/documents/:id
// @desc    Get document by ID (public access)
// @access  Public
router.get('/:id', validateId, async (req, res, next) => {
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
          attributes: ['id', 'email']
        }
      ],
      attributes: { exclude: ['file_data'] } // Exclude file data for detail view
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/documents/:id/download
// @desc    Download document file (public access)
// @access  Public
router.get('/:id/download', validateId, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!document.is_public) {
      return res.status(403).json({
        success: false,
        message: 'Document is not available for download'
      });
    }

    // Increment download count
    await document.increment('download_count');

    // Set appropriate headers
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    res.setHeader('Content-Length', document.file_size);

    // Send file data
    res.send(document.file_data);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/documents/:id/preview
// @desc    Preview document file inline (public access)
// @access  Public
router.get('/:id/preview', validateId, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!document.is_public) {
      return res.status(403).json({
        success: false,
        message: 'Document is not available for preview'
      });
    }

    // Set appropriate headers for inline viewing
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);
    res.setHeader('Content-Length', document.file_size);

    // Send file data
    res.send(document.file_data);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/documents
// @desc    Upload new document (Admin/Sub-admin only)
// @access  Private (Admin/Sub-admin)
router.post('/', 
  authenticateToken, 
  requireSubAdmin, 
  upload.single('file'),
  handleUploadError,
  validateDocumentCreation,
  async (req, res, next) => {
    try {
  const { title, description, university_body_id, document_type } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }

      // University body is now optional: no validation required

      // Verify university body exists if specified
      if (university_body_id) {
        const universityBody = await UniversityBody.findByPk(university_body_id);
        if (!universityBody) {
          return res.status(400).json({
            success: false,
            message: 'University body not found'
          });
        }
      }


      // Set approval status based on user role
      // Admin users can auto-approve their uploads, sub-admins need approval
      const approvalStatus = req.user.role === 'admin' || req.user.role === 'super_admin' 
        ? 'approved' 
        : 'pending';
      
      const isPublic = approvalStatus === 'approved'; // Only approved docs are public

      const document = await Document.create({
        title,
        description,
        file_data: file.buffer,
        file_name: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        uploaded_by_id: req.user.id,
        university_body_id,
        document_type: document_type || 'other',
        approval_status: approvalStatus,
        is_public: isPublic,
        approved_by_id: approvalStatus === 'approved' ? req.user.id : null,
        approved_at: approvalStatus === 'approved' ? new Date() : null
      });

      // Fetch the created document with associations (exclude Category)
      const createdDocument = await Document.findByPk(document.id, {
        include: [
          {
            model: User,
            as: 'uploadedBy',
            attributes: ['id', 'email']
          }
        ],
        attributes: { exclude: ['file_data'] }
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: { document: createdDocument }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/documents/:id
// @desc    Update document (Admin only, author only)
// @access  Private (Admin)
router.put('/:id', authenticateToken, requireAdmin, validateId, validateDocumentUpdate, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user is the author or super admin
    if (document.uploaded_by_id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own documents'
      });
    }

    // Verify category exists if being updated
    if (req.body.category_id) {
      const category = await Category.findByPk(req.body.category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    await document.update(req.body);

    // Fetch updated document with associations
    const updatedDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'uploadedBy',
          attributes: ['id', 'email']
        }
      ],
      attributes: { exclude: ['file_data'] }
    });

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document: updatedDocument }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document (Admin only, author only, within 24 hours)
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

    // Check if user is the author or super admin
    if (document.uploaded_by_id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own documents'
      });
    }

    // Check if user is sub-admin (they cannot delete any documents)
    if (req.user.role === 'sub-admin') {
      return res.status(403).json({
        success: false,
        message: 'Sub-admins cannot delete documents'
      });
    }

    // Check 24-hour rule for admins (super_admin can delete anytime)
    if (req.user.role === 'admin') {
      const uploadTime = new Date(document.created_at);
      const currentTime = new Date();
      const hoursDiff = (currentTime - uploadTime) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return res.status(403).json({
          success: false,
          message: 'Documents can only be deleted within 24 hours of upload'
        });
      }
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

// @route   POST /api/documents/:id/approve
// @desc    Approve a pending document (Admin only)
// @access  Private (Admin)
router.post('/:id/approve', authenticateToken, requireAdmin, validateId, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);

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

// @route   POST /api/documents/:id/reject
// @desc    Reject a pending document (Admin only)
// @access  Private (Admin)
router.post('/:id/reject', authenticateToken, requireAdmin, validateId, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const document = await Document.findByPk(req.params.id);

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

module.exports = router;
