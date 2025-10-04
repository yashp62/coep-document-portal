const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const requireSuperAdmin = requireRole('super_admin');
const requireAdmin = requireRole(['admin', 'super_admin']);
const requireSubAdmin = requireRole(['sub_admin', 'admin', 'super_admin']);

// Helper function to check if user can manage documents for a specific university body
const requireDocumentAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userRole = req.user.role;
  
  // Super admin can access everything
  if (userRole === 'super_admin') {
    return next();
  }

  // Admin and sub-admin need to be associated with a university body
  if (userRole === 'admin' || userRole === 'sub_admin') {
    // If checking a specific document, verify university body access
    if (req.params.id || req.body.university_body_id) {
      const Document = require('../models/Document');
      let documentBodyId = req.body.university_body_id;
      
      if (req.params.id) {
        const document = await Document.findByPk(req.params.id);
        if (!document) {
          return res.status(404).json({
            success: false,
            message: 'Document not found'
          });
        }
        documentBodyId = document.university_body_id;
      }

      // Check if user's university body matches document's university body
      if (documentBodyId && req.user.university_body_id !== documentBodyId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Document belongs to different university body'
        });
      }
    }
    
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Insufficient permissions'
  });
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSuperAdmin,
  requireAdmin,
  requireSubAdmin,
  requireDocumentAccess
};
