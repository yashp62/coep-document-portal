const { sequelize } = require('../config/database');
const User = require('./User');
const Document = require('./Document');
const UniversityBody = require('./UniversityBody');

// Define associations
// User associations
User.hasMany(Document, {
  foreignKey: 'uploaded_by_id',
  as: 'uploadedDocuments'
});

// University body associations - simplified to avoid conflicts
UniversityBody.belongsTo(User, {
  foreignKey: 'admin_id',
  as: 'admin'
});

// User to university body association for user profiles
User.belongsTo(UniversityBody, {
  foreignKey: 'university_body_id',
  as: 'universityBody'
});

// Document associations
Document.belongsTo(User, {
  foreignKey: 'uploaded_by_id',
  as: 'uploadedBy'
});

// Approval association - now enabled
Document.belongsTo(User, {
  foreignKey: 'approved_by_id',
  as: 'approvedBy'
});

User.hasMany(Document, {
  foreignKey: 'approved_by_id',
  as: 'approvedDocuments'
});

Document.belongsTo(UniversityBody, {
  foreignKey: 'university_body_id',
  as: 'universityBody'
});

UniversityBody.hasMany(Document, {
  foreignKey: 'university_body_id',
  as: 'documents'
});

module.exports = {
  sequelize,
  User,
  Document,
  UniversityBody
};
