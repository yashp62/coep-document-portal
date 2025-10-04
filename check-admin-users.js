#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const path = require('path');

// Import database configuration
const { sequelize } = require('./backend/src/config/database');
const { User, UniversityBody } = require('./backend/src/models');

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking Admin Users and University Body Associations...\n');

    await sequelize.authenticate();
    console.log('✅ Database connection established.\n');

    // Get all admin users
    const adminUsers = await User.findAll({
      where: {
        role: 'admin'
      },
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          required: false // LEFT JOIN to see users without university bodies
        }
      ]
    });

    console.log(`📊 Found ${adminUsers.length} admin user(s):\n`);

    for (const admin of adminUsers) {
      console.log(`👤 Admin: ${admin.email}`);
      console.log(`   - ID: ${admin.id}`);
      console.log(`   - University Body ID: ${admin.university_body_id || 'NULL ❌'}`);
      console.log(`   - Associated University Body: ${admin.universityBody ? admin.universityBody.name : 'None ❌'}`);
      console.log('');
    }

    // Check if any admin lacks university body association
    const adminsWithoutBody = adminUsers.filter(admin => !admin.university_body_id);
    
    if (adminsWithoutBody.length > 0) {
      console.log('⚠️  ISSUE FOUND: Some admin users are not associated with university bodies!');
      console.log('   This will cause 500 error during document upload.\n');
      
      // Get available university bodies
      const universityBodies = await UniversityBody.findAll();
      console.log(`📋 Available University Bodies (${universityBodies.length}):`);
      for (const body of universityBodies) {
        console.log(`   - ID: ${body.id}, Name: ${body.name}, Type: ${body.type}`);
      }
      console.log('');
      
      console.log('🔧 To fix this issue, you need to:');
      console.log('   1. Update admin users to have university_body_id');
      console.log('   2. Or create university bodies if none exist');
      console.log('   3. Example SQL: UPDATE users SET university_body_id = 1 WHERE role = "admin"');
    } else {
      console.log('✅ All admin users have university body associations!');
    }

  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAdminUsers();