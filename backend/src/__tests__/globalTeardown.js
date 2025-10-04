const { sequelize } = require('../config/database');

module.exports = async () => {
  console.log('Cleaning up test database...');
  await sequelize.close();
};