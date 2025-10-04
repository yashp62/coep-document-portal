#!/usr/bin/env node

// Database cleanup script to remove documents and ensure data consistency
require('dotenv').config({ path: './backend/.env' });
const { sequelize } = require('./backend/src/config/database');
const { Document, User, UniversityBody } = require('./backend/src/models');

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // 1. Delete all documents
    console.log('\n1. Removing all documents...');
    const deletedDocuments = await Document.destroy({
      where: {},
      truncate: true
    });
    console.log(`✅ Removed all documents from database`);

    // 2. Find all users with their university bodies
    console.log('\n2. Analyzing user-university body relationships...');
    const usersWithBodies = await User.findAll({
      include: [
        {
          model: UniversityBody,
          as: 'universityBody',
          attributes: ['id', 'name', 'type']
        }
      ],
      where: {
        role: ['admin', 'sub_admin']
      }
    });

    // Group users by university body
    const universityBodyUsers = {};
    usersWithBodies.forEach(user => {
      if (user.universityBody) {
        const bodyId = user.universityBody.id;
        if (!universityBodyUsers[bodyId]) {
          universityBodyUsers[bodyId] = {
            universityBody: user.universityBody,
            admins: [],
            subAdmins: []
          };
        }
        
        if (user.role === 'admin') {
          universityBodyUsers[bodyId].admins.push(user);
        } else if (user.role === 'sub_admin') {
          universityBodyUsers[bodyId].subAdmins.push(user);
        }
      }
    });

    // 3. Identify university bodies with both admin and sub-admin
    console.log('\n3. Identifying valid university bodies...');
    const validUniversityBodies = [];
    const invalidUniversityBodies = [];

    Object.values(universityBodyUsers).forEach(bodyData => {
      if (bodyData.admins.length > 0 && bodyData.subAdmins.length > 0) {
        validUniversityBodies.push(bodyData.universityBody);
        console.log(`✅ Valid: ${bodyData.universityBody.name} (${bodyData.admins.length} admin(s), ${bodyData.subAdmins.length} sub-admin(s))`);
      } else {
        invalidUniversityBodies.push(bodyData.universityBody);
        console.log(`❌ Invalid: ${bodyData.universityBody.name} (${bodyData.admins.length} admin(s), ${bodyData.subAdmins.length} sub-admin(s))`);
      }
    });

    // 4. Remove users from invalid university bodies
    console.log('\n4. Cleaning up users from invalid university bodies...');
    for (const invalidBody of invalidUniversityBodies) {
      // Set university_body_id to null for users in invalid bodies
      const updatedUsers = await User.update(
        { university_body_id: null },
        {
          where: {
            university_body_id: invalidBody.id,
            role: ['admin', 'sub_admin']
          }
        }
      );
      console.log(`✅ Removed ${updatedUsers[0]} user(s) from ${invalidBody.name}`);
    }

    // 5. Remove invalid university bodies
    console.log('\n5. Removing invalid university bodies...');
    const invalidBodyIds = invalidUniversityBodies.map(body => body.id);
    if (invalidBodyIds.length > 0) {
      const deletedBodies = await UniversityBody.destroy({
        where: {
          id: invalidBodyIds
        }
      });
      console.log(`✅ Removed ${deletedBodies} invalid university bodies`);
    } else {
      console.log('✅ No invalid university bodies to remove');
    }

    // 6. Final summary
    console.log('\n📊 Final Database State:');
    console.log('=====================================');
    
    const finalUniversityBodies = await UniversityBody.findAll({
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ]
    });

    for (const body of finalUniversityBodies) {
      console.log(`\n🏛️  ${body.name} (${body.type})`);
      
      // Get admins
      const admins = await User.findAll({
        where: {
          university_body_id: body.id,
          role: 'admin'
        },
        attributes: ['email', 'first_name', 'last_name']
      });
      
      // Get sub-admins
      const subAdmins = await User.findAll({
        where: {
          university_body_id: body.id,
          role: 'sub_admin'
        },
        attributes: ['email', 'first_name', 'last_name']
      });

      console.log(`   👨‍💼 Admins (${admins.length}):`);
      admins.forEach(admin => {
        console.log(`      - ${admin.first_name} ${admin.last_name} (${admin.email})`);
      });

      console.log(`   👥 Sub-admins (${subAdmins.length}):`);
      subAdmins.forEach(subAdmin => {
        console.log(`      - ${subAdmin.first_name} ${subAdmin.last_name} (${subAdmin.email})`);
      });
    }

    // Count totals
    const totalDocuments = await Document.count();
    const totalUsers = await User.count();
    const totalUniversityBodies = await UniversityBody.count();

    console.log('\n📈 Summary:');
    console.log(`   📄 Documents: ${totalDocuments}`);
    console.log(`   👤 Users: ${totalUsers}`);
    console.log(`   🏛️  University Bodies: ${totalUniversityBodies}`);

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Login as a sub-admin and upload documents');
    console.log('   2. Login as admin to approve documents');
    console.log('   3. Verify document visibility rules work correctly');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the cleanup
cleanupDatabase();