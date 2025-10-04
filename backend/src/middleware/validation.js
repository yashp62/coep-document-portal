const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserCreation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .isIn(['director', 'super_admin'])
    .withMessage('Role must be either director or super_admin'),
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('designation')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Designation must be between 1 and 255 characters'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 10})
    .withMessage('Phone number must be valid 10 characters'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['director', 'super_admin'])
    .withMessage('Role must be director or super_admin'),
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('designation')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Designation must be between 1 and 255 characters'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 10})
    .withMessage('Phone number must valid 10 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Document validation rules
const validateDocumentCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('board_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid board ID is required'),
  body('committee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid committee ID is required'),
  body('document_type')
    .optional()
    .isIn(['minutes', 'circular', 'notice', 'other'])
    .withMessage('Document type must be minutes, circular, notice, or other'),
  handleValidationErrors
];

const validateDocumentUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('board_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid board ID is required'),
  body('committee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid committee ID is required'),
  body('document_type')
    .optional()
    .isIn(['minutes', 'circular', 'notice', 'other'])
    .withMessage('Document type must be minutes, circular, notice, or other'),
  handleValidationErrors
];

// Category validation rules
const validateCategoryCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Category name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];

const validateCategoryUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Category name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];

// Parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserCreation,
  validateUserUpdate,
  validateLogin,
  validateDocumentCreation,
  validateDocumentUpdate,
  validateCategoryCreation,
  validateCategoryUpdate,
  validateId,
  validatePagination
};
