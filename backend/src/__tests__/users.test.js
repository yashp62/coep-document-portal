const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/users');
const User = require('../../models/User');
const { createTestUser, createSuperAdminUser, generateTestToken, getAuthHeaders } = require('../testHelpers');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  let superAdminUser, superAdminToken, directorUser, directorToken;

  beforeEach(async () => {
    superAdminUser = await createSuperAdminUser();
    superAdminToken = generateTestToken(superAdminUser);
    
    directorUser = await createTestUser();
    directorToken = generateTestToken(directorUser);
  });

  describe('GET /api/users', () => {
    it('should get all users as super admin', async () => {
      await createTestUser({ email: 'user1@example.com' });
      await createTestUser({ email: 'user2@example.com' });

      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(4); // 2 created + superAdmin + director
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should fail as director', async () => {
      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeaders(directorToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Super Admin required.');
    });

    it('should support pagination', async () => {
      // Create multiple users
      for (let i = 0; i < 5; i++) {
        await createTestUser({ email: `user${i}@example.com` });
      }

      const response = await request(app)
        .get('/api/users?page=1&limit=3')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.data.users).toHaveLength(3);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(3);
    });

    it('should support search', async () => {
      await createTestUser({ 
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe'
      });

      const response = await request(app)
        .get('/api/users?search=john')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.users[0].first_name).toBe('John');
    });

    it('should filter by role', async () => {
      await createTestUser({ role: 'director' });
      await createSuperAdminUser({ email: 'admin2@example.com' });

      const response = await request(app)
        .get('/api/users?role=director')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.data.users.every(user => user.role === 'director')).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id as super admin', async () => {
      const user = await createTestUser({ email: 'gettest@example.com' });

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe('gettest@example.com');
    });

    it('should fail with invalid id', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail when user not found', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /api/users', () => {
    const validUserData = {
      email: 'newuser@example.com',
      password: 'Password123',
      role: 'director',
      first_name: 'New',
      last_name: 'User',
      designation: 'Test Director',
      phone: '1234567890'
    };

    it('should create user as super admin', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(superAdminToken))
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.password_hash).toBeUndefined();

      // Verify user was created in database
      const user = await User.findOne({ where: { email: validUserData.email } });
      expect(user).toBeTruthy();
      expect(user.role).toBe(validUserData.role);
    });

    it('should fail with duplicate email', async () => {
      await createTestUser({ email: validUserData.email });

      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(superAdminToken))
        .send(validUserData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already exists');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(superAdminToken))
        .send({
          ...validUserData,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(superAdminToken))
        .send({
          ...validUserData,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid role', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(superAdminToken))
        .send({
          ...validUserData,
          role: 'invalid_role'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail as director', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(directorToken))
        .send(validUserData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user as super admin', async () => {
      const user = await createTestUser({ email: 'update@example.com' });

      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        designation: 'Updated Director'
      };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set(getAuthHeaders(superAdminToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.first_name).toBe('Updated');
      expect(response.body.data.user.last_name).toBe('Name');
    });

    it('should update password with hashing', async () => {
      const user = await createTestUser({ email: 'updatepwd@example.com' });

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set(getAuthHeaders(superAdminToken))
        .send({
          password: 'NewPassword123'
        });

      expect(response.status).toBe(200);

      // Verify password was hashed
      const updatedUser = await User.findByPk(user.id);
      expect(await updatedUser.validatePassword('NewPassword123')).toBe(true);
    });

    it('should fail when user not found', async () => {
      const response = await request(app)
        .put('/api/users/99999')
        .set(getAuthHeaders(superAdminToken))
        .send({ first_name: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as super admin', async () => {
      const user = await createTestUser({ email: 'delete@example.com' });

      const response = await request(app)
        .delete(`/api/users/${user.id}`)
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user was deleted
      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).toBeNull();
    });

    it('should fail to delete own account', async () => {
      const response = await request(app)
        .delete(`/api/users/${superAdminUser.id}`)
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot delete your own account');
    });

    it('should fail when user not found', async () => {
      const response = await request(app)
        .delete('/api/users/99999')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id/toggle-status', () => {
    it('should toggle user status', async () => {
      const user = await createTestUser({ 
        email: 'toggle@example.com',
        is_active: true
      });

      const response = await request(app)
        .put(`/api/users/${user.id}/toggle-status`)
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.is_active).toBe(false);

      // Toggle back
      const response2 = await request(app)
        .put(`/api/users/${user.id}/toggle-status`)
        .set(getAuthHeaders(superAdminToken));

      expect(response2.body.data.user.is_active).toBe(true);
    });

    it('should fail to toggle own status', async () => {
      const response = await request(app)
        .put(`/api/users/${superAdminUser.id}/toggle-status`)
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot modify your own status');
    });
  });
});