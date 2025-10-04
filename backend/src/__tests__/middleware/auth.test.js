const request = require('supertest');
const express = require('express');
const { authenticateToken, requireSuperAdmin, requireDirector } = require('../../middleware/auth');
const { createTestUser, createSuperAdminUser, generateTestToken, getAuthHeaders } = require('../testHelpers');

const app = express();
app.use(express.json());

// Test routes for middleware
app.get('/auth-required', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/super-admin-only', authenticateToken, requireSuperAdmin, (req, res) => {
  res.json({ success: true, message: 'Super admin access granted' });
});

app.get('/director-only', authenticateToken, requireDirector, (req, res) => {
  res.json({ success: true, message: 'Director access granted' });
});

describe('Authentication Middleware', () => {
  let superAdminUser, superAdminToken, directorUser, directorToken;

  beforeEach(async () => {
    superAdminUser = await createSuperAdminUser();
    superAdminToken = generateTestToken(superAdminUser);
    
    directorUser = await createTestUser();
    directorToken = generateTestToken(directorUser);
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', async () => {
      const response = await request(app)
        .get('/auth-required')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.id).toBe(superAdminUser.id);
      expect(response.body.user.email).toBe(superAdminUser.email);
    });

    it('should fail with no token', async () => {
      const response = await request(app)
        .get('/auth-required');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token provided');
    });

    it('should fail with invalid token format', async () => {
      const response = await request(app)
        .get('/auth-required')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token format');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/auth-required')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should fail with expired token', async () => {
      const expiredToken = require('jsonwebtoken').sign(
        { id: superAdminUser.id, email: superAdminUser.email, role: superAdminUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/auth-required')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token expired');
    });

    it('should fail with token for non-existent user', async () => {
      const fakeToken = require('jsonwebtoken').sign(
        { id: 99999, email: 'fake@example.com', role: 'director' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get('/auth-required')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should fail with inactive user token', async () => {
      const inactiveUser = await createTestUser({
        email: 'inactive@example.com',
        is_active: false
      });
      const inactiveToken = generateTestToken(inactiveUser);

      const response = await request(app)
        .get('/auth-required')
        .set(getAuthHeaders(inactiveToken));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated');
    });
  });

  describe('requireSuperAdmin', () => {
    it('should allow super admin access', async () => {
      const response = await request(app)
        .get('/super-admin-only')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Super admin access granted');
    });

    it('should deny director access', async () => {
      const response = await request(app)
        .get('/super-admin-only')
        .set(getAuthHeaders(directorToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Super Admin required.');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/super-admin-only');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('requireDirector', () => {
    it('should allow director access', async () => {
      const response = await request(app)
        .get('/director-only')
        .set(getAuthHeaders(directorToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Director access granted');
    });

    it('should allow super admin access', async () => {
      const response = await request(app)
        .get('/director-only')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Director access granted');
    });

    it('should fail with invalid role in token', async () => {
      const invalidRoleToken = require('jsonwebtoken').sign(
        { id: directorUser.id, email: directorUser.email, role: 'invalid_role' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get('/director-only')
        .set('Authorization', `Bearer ${invalidRoleToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Director access required.');
    });
  });
});