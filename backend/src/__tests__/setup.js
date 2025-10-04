const { sequelize } = require('../config/database');

// Global test setup
beforeAll(async () => {
  // Force sync database for testing
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// Clear all tables between tests
afterEach(async () => {
  const models = Object.values(sequelize.models);
  await Promise.all(models.map(model => model.destroy({ where: {}, force: true })));
});

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';