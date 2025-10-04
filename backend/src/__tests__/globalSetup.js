const { sequelize } = require('../config/database');

module.exports = async () => {
  // Setup test database
  console.log('Setting up test database...');
  
  try {
    await sequelize.authenticate();
    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Unable to connect to test database:', error);
    process.exit(1);
  }
};