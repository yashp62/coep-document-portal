const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Test user factory
const createTestUser = async (overrides = {}) => {
  const userData = {
    email: 'test@example.com',
    password_hash: await bcrypt.hash('Password123', 12),
    role: 'director',
    first_name: 'Test',
    last_name: 'User',
    designation: 'Test Director',
    phone: '1234567890',
    is_active: true,
    ...overrides
  };

  return await User.create(userData);
};

// Create super admin user
const createSuperAdminUser = async (overrides = {}) => {
  return await createTestUser({
    email: 'admin@example.com',
    role: 'super_admin',
    first_name: 'Super',
    last_name: 'Admin',
    ...overrides
  });
};

// Generate JWT token for testing
const generateTestToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Mock authentication headers
const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});

module.exports = {
  createTestUser,
  createSuperAdminUser,
  generateTestToken,
  getAuthHeaders
};