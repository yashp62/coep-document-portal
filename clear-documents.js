#!/usr/bin/env node

// Script to clear all documents from the database
require('dotenv').config({ path: './backend/.env' });
const { sequelize } = require('./backend/src/config/database');
const { Document } = require('./backend/src/models');

async function clearDocuments() {
  console.log('🗑️  Clearing all documents from database...\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Count existing documents
    const existingCount = await Document.count();
    console.log(`📊 Found ${existingCount} documents in the database`);

    if (existingCount === 0) {
      console.log('✅ Documents table is already empty');
      return;
    }

    // Delete all documents
    console.log('\n🗑️  Removing all documents...');
    const deletedCount = await Document.destroy({
      where: {},
      truncate: true
    });
    
    console.log(`✅ Successfully removed all documents from the database`);

    // Verify deletion
    const remainingCount = await Document.count();
    console.log(`📊 Remaining documents: ${remainingCount}`);

    console.log('\n🎉 Documents table cleared successfully!');
    console.log('💡 You can now manually upload documents to test the approval workflow.');

  } catch (error) {
    console.error('❌ Error clearing documents:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
clearDocuments();