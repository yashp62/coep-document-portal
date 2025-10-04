#!/usr/bin/env node

// Additional cleanup to remove empty university bodies
require('dotenv').config({ path: './backend/.env' });
const { sequelize } = require('./backend/src/config/database');
const { UniversityBody, User } = require('./backend/src/models');

async function removeEmptyUniversityBodies() {
  console.log('🧹 Removing empty university bodies...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Find university bodies with no admin or sub-admin users
    const allBodies = await UniversityBody.findAll({
      attributes: ['id', 'name', 'type']
    });

    const emptyBodies = [];
    const validBodies = [];

    for (const body of allBodies) {
      const userCount = await User.count({
        where: {
          university_body_id: body.id,
          role: ['admin', 'sub_admin']
        }
      });

      if (userCount === 0) {
        emptyBodies.push(body);
      } else {
        validBodies.push(body);
      }
    }

    console.log('\n📊 Analysis:');
    console.log(`   Valid university bodies: ${validBodies.length}`);
    console.log(`   Empty university bodies: ${emptyBodies.length}`);

    if (emptyBodies.length > 0) {
      console.log('\n❌ Removing empty university bodies:');
      for (const body of emptyBodies) {
        console.log(`   - ${body.name} (${body.type})`);
      }

      const emptyBodyIds = emptyBodies.map(body => body.id);
      const deletedCount = await UniversityBody.destroy({
        where: {
          id: emptyBodyIds
        }
      });

      console.log(`\n✅ Removed ${deletedCount} empty university bodies`);
    } else {
      console.log('\n✅ No empty university bodies found');
    }

    // Final summary
    console.log('\n📊 Final Valid University Bodies:');
    console.log('=====================================');
    
    for (const body of validBodies) {
      const admins = await User.findAll({
        where: {
          university_body_id: body.id,
          role: 'admin'
        },
        attributes: ['email', 'first_name', 'last_name']
      });
      
      const subAdmins = await User.findAll({
        where: {
          university_body_id: body.id,
          role: 'sub_admin'
        },
        attributes: ['email', 'first_name', 'last_name']
      });

      console.log(`\n🏛️  ${body.name} (${body.type})`);
      console.log(`   👨‍💼 Admins: ${admins.length}`);
      console.log(`   👥 Sub-admins: ${subAdmins.length}`);
    }

    const finalCount = await UniversityBody.count();
    console.log(`\n📈 Total university bodies remaining: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

removeEmptyUniversityBodies();