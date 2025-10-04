const request = require('supertest');
const express = require('express');
const universityBodyRoutes = require('../../routes/universityBodies');
const UniversityBody = require('../../models/UniversityBody');
const { createTestUser, createSuperAdminUser, generateTestToken, getAuthHeaders } = require('../testHelpers');

const app = express();
app.use(express.json());
app.use('/api/university-bodies', universityBodyRoutes);

describe('University Body Routes', () => {
  let superAdminUser, superAdminToken, directorUser, directorToken;

  beforeEach(async () => {
    superAdminUser = await createSuperAdminUser();
    superAdminToken = generateTestToken(superAdminUser);
    
    directorUser = await createTestUser();
    directorToken = generateTestToken(directorUser);
  });

  describe('GET /api/university-bodies', () => {
    it('should get all university bodies (public endpoint)', async () => {
      await UniversityBody.create({
        name: 'Academic Council',
        type: 'council',
        description: 'Academic decision making body',
        director_id: directorUser.id
      });

      await UniversityBody.create({
        name: 'Finance Committee',
        type: 'committee',
        description: 'Financial oversight committee',
        director_id: directorUser.id
      });

      const response = await request(app)
        .get('/api/university-bodies');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.universityBodies).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should support search functionality', async () => {
      await UniversityBody.create({
        name: 'Academic Council',
        type: 'council',
        description: 'Academic decisions',
        director_id: directorUser.id
      });

      await UniversityBody.create({
        name: 'Sports Committee',
        type: 'committee',
        description: 'Sports activities',
        director_id: directorUser.id
      });

      const response = await request(app)
        .get('/api/university-bodies?search=academic');

      expect(response.status).toBe(200);
      expect(response.body.data.universityBodies).toHaveLength(1);
      expect(response.body.data.universityBodies[0].name).toBe('Academic Council');
    });

    it('should filter by type', async () => {
      await UniversityBody.create({
        name: 'Academic Council',
        type: 'council',
        description: 'Academic decisions',
        director_id: directorUser.id
      });

      await UniversityBody.create({
        name: 'Sports Committee',
        type: 'committee',
        description: 'Sports activities',
        director_id: directorUser.id
      });

      const response = await request(app)
        .get('/api/university-bodies?type=committee');

      expect(response.status).toBe(200);
      expect(response.body.data.universityBodies).toHaveLength(1);
      expect(response.body.data.universityBodies[0].type).toBe('committee');
    });

    it('should support pagination', async () => {
      // Create multiple bodies
      for (let i = 0; i < 5; i++) {
        await UniversityBody.create({
          name: `Body ${i}`,
          type: 'committee',
          description: `Description ${i}`,
          director_id: directorUser.id
        });
      }

      const response = await request(app)
        .get('/api/university-bodies?page=1&limit=3');

      expect(response.status).toBe(200);
      expect(response.body.data.universityBodies).toHaveLength(3);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.hasNextPage).toBe(true);
    });

    it('should filter by active status', async () => {
      await UniversityBody.create({
        name: 'Active Body',
        type: 'committee',
        description: 'Active body',
        director_id: directorUser.id,
        is_active: true
      });

      await UniversityBody.create({
        name: 'Inactive Body',
        type: 'committee', 
        description: 'Inactive body',
        director_id: directorUser.id,
        is_active: false
      });

      const response = await request(app)
        .get('/api/university-bodies?is_active=true');

      expect(response.status).toBe(200);
      expect(response.body.data.universityBodies).toHaveLength(1);
      expect(response.body.data.universityBodies[0].is_active).toBe(true);
    });
  });

  describe('GET /api/university-bodies/:id', () => {
    it('should get university body by id', async () => {
      const body = await UniversityBody.create({
        name: 'Test Body',
        type: 'committee',
        description: 'Test description',
        director_id: directorUser.id
      });

      const response = await request(app)
        .get(`/api/university-bodies/${body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.universityBody.id).toBe(body.id);
      expect(response.body.data.universityBody.director).toBeDefined();
    });

    it('should fail with invalid id', async () => {
      const response = await request(app)
        .get('/api/university-bodies/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail when body not found', async () => {
      const response = await request(app)
        .get('/api/university-bodies/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('University body not found');
    });
  });

  describe('POST /api/university-bodies', () => {
    const validBodyData = {
      name: 'New Committee',
      type: 'committee',
      description: 'New committee description',
      director_id: null // will be set in tests
    };

    it('should create university body as super admin', async () => {
      const bodyData = { ...validBodyData, director_id: directorUser.id };

      const response = await request(app)
        .post('/api/university-bodies')
        .set(getAuthHeaders(superAdminToken))
        .send(bodyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.universityBody.name).toBe(bodyData.name);
      expect(response.body.data.universityBody.type).toBe(bodyData.type);

      // Verify created in database
      const body = await UniversityBody.findOne({ where: { name: bodyData.name } });
      expect(body).toBeTruthy();
    });

    it('should create university body as director', async () => {
      const bodyData = { ...validBodyData, director_id: directorUser.id };

      const response = await request(app)
        .post('/api/university-bodies')
        .set(getAuthHeaders(directorToken))
        .send(bodyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should fail with duplicate name', async () => {
      const bodyData = { ...validBodyData, director_id: directorUser.id };
      
      await UniversityBody.create(bodyData);

      const response = await request(app)
        .post('/api/university-bodies')
        .set(getAuthHeaders(superAdminToken))
        .send(bodyData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('University body with this name already exists');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/university-bodies')
        .set(getAuthHeaders(superAdminToken))
        .send({
          // missing name
          type: 'committee'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail with invalid type', async () => {
      const bodyData = { ...validBodyData, type: 'invalid_type', director_id: directorUser.id };

      const response = await request(app)
        .post('/api/university-bodies')
        .set(getAuthHeaders(superAdminToken))
        .send(bodyData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid director_id', async () => {
      const bodyData = { ...validBodyData, director_id: 99999 };

      const response = await request(app)
        .post('/api/university-bodies')
        .set(getAuthHeaders(superAdminToken))
        .send(bodyData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Director not found');
    });

    it('should fail without authentication', async () => {
      const bodyData = { ...validBodyData, director_id: directorUser.id };

      const response = await request(app)
        .post('/api/university-bodies')
        .send(bodyData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/university-bodies/:id', () => {
    it('should update university body as super admin', async () => {
      const body = await UniversityBody.create({
        name: 'Original Name',
        type: 'committee',
        description: 'Original description',
        director_id: directorUser.id
      });

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/university-bodies/${body.id}`)
        .set(getAuthHeaders(superAdminToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.universityBody.name).toBe('Updated Name');
      expect(response.body.data.universityBody.description).toBe('Updated description');
    });

    it('should fail when body not found', async () => {
      const response = await request(app)
        .put('/api/university-bodies/99999')
        .set(getAuthHeaders(superAdminToken))
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate name', async () => {
      const body1 = await UniversityBody.create({
        name: 'Existing Body',
        type: 'committee',
        description: 'Description',
        director_id: directorUser.id
      });

      const body2 = await UniversityBody.create({
        name: 'Another Body',
        type: 'committee',
        description: 'Description',
        director_id: directorUser.id
      });

      const response = await request(app)
        .put(`/api/university-bodies/${body2.id}`)
        .set(getAuthHeaders(superAdminToken))
        .send({ name: 'Existing Body' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/university-bodies/:id', () => {
    it('should delete university body as super admin', async () => {
      const body = await UniversityBody.create({
        name: 'To Delete',
        type: 'committee',
        description: 'Description',
        director_id: directorUser.id
      });

      const response = await request(app)
        .delete(`/api/university-bodies/${body.id}`)
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('University body deleted successfully');

      // Verify deleted
      const deleted = await UniversityBody.findByPk(body.id);
      expect(deleted).toBeNull();
    });

    it('should fail when body not found', async () => {
      const response = await request(app)
        .delete('/api/university-bodies/99999')
        .set(getAuthHeaders(superAdminToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should fail as director', async () => {
      const body = await UniversityBody.create({
        name: 'To Delete',
        type: 'committee',
        description: 'Description',
        director_id: directorUser.id
      });

      const response = await request(app)
        .delete(`/api/university-bodies/${body.id}`)
        .set(getAuthHeaders(directorToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});