#!/usr/bin/env node

// Debug script to test frontend API calls
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test credentials
const testUser = {
  email: 'admin.examinations@coep.ac.in',
  password: 'admin123'
};

async function testAPIEndpoints() {
  console.log('🔍 Testing API endpoints that are causing loading issues...\n');

  try {
    // 1. Login to get token
    console.log('1. 🔐 Logging in...');
    const loginResult = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
    const token = loginResult.data.data.token;
    console.log('   ✅ Login successful');

    // 2. Test public documents (for dashboard)
    console.log('\n2. 📄 Testing public documents endpoint (for dashboard)...');
    const start1 = Date.now();
    const publicDocs = await axios.get(`${BASE_URL}/api/documents?limit=5&sort_by=created_at&sort_order=DESC`);
    const end1 = Date.now();
    console.log(`   ✅ Public documents: ${publicDocs.data.data.documents.length} documents (${end1 - start1}ms)`);

    // 3. Test admin documents endpoint
    console.log('\n3. 📄 Testing admin documents endpoint...');
    const start2 = Date.now();
    const adminDocs = await axios.get(`${BASE_URL}/api/admin/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const end2 = Date.now();
    console.log(`   ✅ Admin documents: ${adminDocs.data.data.documents.length} documents (${end2 - start2}ms)`);

    // 4. Test the old admin/all endpoint that was being called
    console.log('\n4. 🔍 Testing old admin/all endpoint (should fail)...');
    try {
      const start3 = Date.now();
      const oldAdminDocs = await axios.get(`${BASE_URL}/api/documents/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const end3 = Date.now();
      console.log(`   ⚠️  Old endpoint responded: ${oldAdminDocs.data.data.documents.length} documents (${end3 - start3}ms)`);
    } catch (error) {
      console.log(`   ❌ Old endpoint failed as expected: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // 5. Test pending documents
    console.log('\n5. 📋 Testing pending documents endpoint...');
    const start4 = Date.now();
    const pendingDocs = await axios.get(`${BASE_URL}/api/admin/documents/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const end4 = Date.now();
    console.log(`   ✅ Pending documents: ${pendingDocs.data.data.documents.length} documents (${end4 - start4}ms)`);

    console.log('\n🎉 All API endpoints tested successfully!');
    console.log('\n💡 If the frontend is still loading, the issue might be:');
    console.log('   1. Frontend API service configuration');
    console.log('   2. Redux state management');
    console.log('   3. Component lifecycle issues');
    console.log('   4. Browser caching');

  } catch (error) {
    console.log(`❌ Test failed: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
  }
}

// Run the test
testAPIEndpoints();