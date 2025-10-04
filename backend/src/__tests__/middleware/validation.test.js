const request = require('supertest');
const express = require('express');
const { body, query } = require('express-validator');
const { 
  validateUserCreation, 
  validateUserUpdate,
  validateLogin,
  validateId,
  validatePagination,
  handleValidationErrors
} = require('../../middleware/validation');

const app = express();
app.use(express.json());

// Test routes for validation middleware
app.post('/test-user-creation', validateUserCreation, (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

app.put('/test-user-update', validateUserUpdate, (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

app.post('/test-login', validateLogin, (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

app.get('/test-id/:id', validateId, (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

app.get('/test-pagination', validatePagination, (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

// Test route for handleValidationErrors
app.post('/test-validation-errors', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('age').isInt({ min: 18 }).withMessage('Age must be at least 18'),
  handleValidationErrors
], (req, res) => {
  res.json({ success: true, message: 'Validation passed' });
});

describe('Validation Middleware', () => {
  describe('validateUserCreation', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Password123',
      role: 'director',
      first_name: 'John',
      last_name: 'Doe',
      designation: 'Director',
      phone: '1234567890'
    };

    it('should pass with valid user data', async () => {
      const response = await request(app)
        .post('/test-user-creation')
        .send(validUserData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/test-user-creation')
        .send({
          ...validUserData,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Please provide a valid email address'
          })
        ])
      );
    });

    it('should fail with missing email', async () => {
      const { email, ...dataWithoutEmail } = validUserData;
      const response = await request(app)
        .post('/test-user-creation')
        .send(dataWithoutEmail);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Email is required'
          })
        ])
      );
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/test-user-creation')
        .send({
          ...validUserData,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringContaining('Password must be at least 8 characters')
          })
        ])
      );
    });

    it('should fail with invalid role', async () => {
      const response = await request(app)
        .post('/test-user-creation')
        .send({
          ...validUserData,
          role: 'invalid_role'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Role must be either director or super_admin'
          })
        ])
      );
    });

    it('should fail with too long first_name', async () => {
      const response = await request(app)
        .post('/test-user-creation')
        .send({
          ...validUserData,
          first_name: 'a'.repeat(101) // 101 characters
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'First name cannot exceed 100 characters'
          })
        ])
      );
    });

    it('should fail with invalid phone format', async () => {
      const response = await request(app)
        .post('/test-user-creation')
        .send({
          ...validUserData,
          phone: 'invalid-phone'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Phone number can only contain numbers, spaces, hyphens, and plus signs'
          })
        ])
      );
    });
  });

  describe('validateUserUpdate', () => {
    it('should pass with valid update data', async () => {
      const response = await request(app)
        .put('/test-user-update')
        .send({
          first_name: 'Updated',
          last_name: 'Name',
          designation: 'Updated Director'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with invalid email in update', async () => {
      const response = await request(app)
        .put('/test-user-update')
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should pass with empty body (optional fields)', async () => {
      const response = await request(app)
        .put('/test-user-update')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('validateLogin', () => {
    it('should pass with valid login data', async () => {
      const response = await request(app)
        .post('/test-login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with missing email', async () => {
      const response = await request(app)
        .post('/test-login')
        .send({
          password: 'Password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Email is required'
          })
        ])
      );
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/test-login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Password is required'
          })
        ])
      );
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/test-login')
        .send({
          email: 'invalid-email',
          password: 'Password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('validateId', () => {
    it('should pass with valid id', async () => {
      const response = await request(app)
        .get('/test-id/123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with invalid id', async () => {
      const response = await request(app)
        .get('/test-id/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'ID must be a valid integer'
          })
        ])
      );
    });

    it('should fail with negative id', async () => {
      const response = await request(app)
        .get('/test-id/-1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'ID must be a positive integer'
          })
        ])
      );
    });
  });

  describe('validatePagination', () => {
    it('should pass with valid pagination parameters', async () => {
      const response = await request(app)
        .get('/test-pagination?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should pass with no pagination parameters', async () => {
      const response = await request(app)
        .get('/test-pagination');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with invalid page', async () => {
      const response = await request(app)
        .get('/test-pagination?page=invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Page must be a positive integer'
          })
        ])
      );
    });

    it('should fail with zero page', async () => {
      const response = await request(app)
        .get('/test-pagination?page=0');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid limit', async () => {
      const response = await request(app)
        .get('/test-pagination?limit=invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with limit exceeding maximum', async () => {
      const response = await request(app)
        .get('/test-pagination?limit=1001');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Limit must be between 1 and 1000'
          })
        ])
      );
    });
  });

  describe('handleValidationErrors', () => {
    it('should return formatted validation errors', async () => {
      const response = await request(app)
        .post('/test-validation-errors')
        .send({
          email: 'invalid-email',
          age: 16
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toHaveLength(2);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'field',
            msg: 'Invalid email format',
            path: 'email'
          }),
          expect.objectContaining({
            type: 'field', 
            msg: 'Age must be at least 18',
            path: 'age'
          })
        ])
      );
    });

    it('should pass when no validation errors', async () => {
      const response = await request(app)
        .post('/test-validation-errors')
        .send({
          email: 'valid@example.com',
          age: 25
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});