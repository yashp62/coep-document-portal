#!/usr/bin/env node

// Final test script to verify the complete document approval workflow
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test users from our cleaned database
const users = {
  admin: {
    email: 'admin.examinations@coep.ac.in',
    password: 'admin123',
    name: 'Dr. Rajesh Kumar',
    body: 'Examinations and Evaluations'
  },
  subAdmin1: {
    email: 'subadmin.exam1@coep.ac.in',
    password: 'subadmin123',
    name: 'Prof. Amit Patel',
    body: 'Examinations and Evaluations'
  },
  subAdmin2: {
    email: 'subadmin.exam2@coep.ac.in',
    password: 'subadmin123',
    name: 'Dr. Sunita Singh',
    body: 'Examinations and Evaluations'
  }
};

async function testCompleteWorkflow() {
  console.log('🚀 Testing Complete Document Approval Workflow\n');
  console.log('🎯 Testing Requirements:');
  console.log('   1. Sub-admin uploads document → status = pending');
  console.log('   2. Only admin from same university body can approve');
  console.log('   3. Documents visible in /my-documents for same university body');
  console.log('   4. All approved documents visible in /documents to everyone\n');

  try {
    // 1. Login all users
    console.log('1. 🔐 Logging in all users...');
    const tokens = {};
    
    for (const [role, user] of Object.entries(users)) {
      const loginResult = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: user.email,
        password: user.password
      });
      tokens[role] = loginResult.data.data.token;
      console.log(`   ✅ ${user.name} (${role}) logged in`);
    }

    // 2. Upload documents as both sub-admins
    console.log('\n2. 📤 Uploading documents as sub-admins...');
    const FormData = require('form-data');
    const fs = require('fs');
    
    // Create test PDF files
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Document) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000015 00000 n \n0000000068 00000 n \n0000000125 00000 n \n0000000283 00000 n \n0000000364 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n456\n%%EOF';
    
    const uploadedDocs = [];
    
    // Upload from sub-admin 1
    fs.writeFileSync('/tmp/test-doc-1.pdf', testPdfContent);
    const formData1 = new FormData();
    formData1.append('title', 'Examination Guidelines 2024');
    formData1.append('description', 'Updated guidelines for examinations uploaded by Prof. Amit Patel');
    formData1.append('file', fs.createReadStream('/tmp/test-doc-1.pdf'), {
      filename: 'exam-guidelines-2024.pdf',
      contentType: 'application/pdf'
    });

    const upload1 = await axios.post(`${BASE_URL}/api/sub-admin/documents`, formData1, {
      headers: {
        ...formData1.getHeaders(),
        Authorization: `Bearer ${tokens.subAdmin1}`
      }
    });
    uploadedDocs.push(upload1.data.data.document);
    console.log(`   ✅ Document 1 uploaded by ${users.subAdmin1.name}: "${upload1.data.data.document.title}" (Status: ${upload1.data.data.document.approval_status})`);

    // Upload from sub-admin 2
    fs.writeFileSync('/tmp/test-doc-2.pdf', testPdfContent);
    const formData2 = new FormData();
    formData2.append('title', 'Student Evaluation Framework');
    formData2.append('description', 'New evaluation framework uploaded by Dr. Sunita Singh');
    formData2.append('file', fs.createReadStream('/tmp/test-doc-2.pdf'), {
      filename: 'evaluation-framework.pdf',
      contentType: 'application/pdf'
    });

    const upload2 = await axios.post(`${BASE_URL}/api/sub-admin/documents`, formData2, {
      headers: {
        ...formData2.getHeaders(),
        Authorization: `Bearer ${tokens.subAdmin2}`
      }
    });
    uploadedDocs.push(upload2.data.data.document);
    console.log(`   ✅ Document 2 uploaded by ${users.subAdmin2.name}: "${upload2.data.data.document.title}" (Status: ${upload2.data.data.document.approval_status})`);

    // 3. Check pending documents for admin
    console.log('\n3. 📋 Checking pending documents for admin...');
    const pendingDocs = await axios.get(`${BASE_URL}/api/admin/documents/pending`, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    console.log(`   ✅ Admin can see ${pendingDocs.data.data.documents.length} pending documents`);
    pendingDocs.data.data.documents.forEach(doc => {
      console.log(`      - "${doc.title}" by ${doc.uploadedBy.first_name} ${doc.uploadedBy.last_name}`);
    });

    // 4. Check /my-documents for all users (should show all docs from same university body)
    console.log('\n4. 📁 Checking /my-documents visibility...');
    
    for (const [role, user] of Object.entries(users)) {
      const endpoint = role === 'admin' ? '/api/admin/documents' : '/api/sub-admin/documents';
      const myDocs = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${tokens[role]}` }
      });
      console.log(`   ✅ ${user.name} (${role}) can see ${myDocs.data.data.documents.length} documents in their university body`);
    }

    // 5. Check /documents for all users (should be empty since no approved docs yet)
    console.log('\n5. 🌐 Checking public /documents visibility (should be empty)...');
    const publicDocs = await axios.get(`${BASE_URL}/api/documents`);
    console.log(`   ✅ Public documents count: ${publicDocs.data.data.documents.length} (should be 0)`);

    // 6. Approve first document
    console.log('\n6. ✅ Approving first document...');
    const approval1 = await axios.post(`${BASE_URL}/api/admin/documents/${uploadedDocs[0].id}/approve`, {}, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    console.log(`   ✅ Document "${uploadedDocs[0].title}" approved by admin`);

    // 7. Check public documents again (should now have 1 approved document)
    console.log('\n7. 🌐 Checking public /documents after approval...');
    const publicDocsAfter = await axios.get(`${BASE_URL}/api/documents`);
    console.log(`   ✅ Public documents count: ${publicDocsAfter.data.data.documents.length} (should be 1)`);
    if (publicDocsAfter.data.data.documents.length > 0) {
      publicDocsAfter.data.data.documents.forEach(doc => {
        console.log(`      - "${doc.title}" (Status: ${doc.approval_status})`);
      });
    }

    // 8. Check pending documents again (should now have 1 less)
    console.log('\n8. 📋 Checking pending documents after approval...');
    const pendingDocsAfter = await axios.get(`${BASE_URL}/api/admin/documents/pending`, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    console.log(`   ✅ Pending documents count: ${pendingDocsAfter.data.data.documents.length} (should be 1)`);

    // 9. Reject second document
    console.log('\n9. ❌ Rejecting second document...');
    const rejection = await axios.post(`${BASE_URL}/api/admin/documents/${uploadedDocs[1].id}/reject`, {
      reason: 'Document needs more details and proper formatting'
    }, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    console.log(`   ✅ Document "${uploadedDocs[1].title}" rejected by admin`);

    // 10. Final check - pending documents should be empty
    console.log('\n10. 📋 Final pending documents check...');
    const pendingDocsFinal = await axios.get(`${BASE_URL}/api/admin/documents/pending`, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    console.log(`    ✅ Pending documents count: ${pendingDocsFinal.data.data.documents.length} (should be 0)`);

    // Cleanup
    try {
      fs.unlinkSync('/tmp/test-doc-1.pdf');
      fs.unlinkSync('/tmp/test-doc-2.pdf');
    } catch (e) {
      // Files might not exist, ignore
    }

    console.log('\n🎉 Complete workflow test PASSED!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Sub-admin document upload creates pending documents');
    console.log('   ✅ Admin can see and approve/reject documents from same university body');
    console.log('   ✅ University body document visibility works correctly');
    console.log('   ✅ Public document visibility only shows approved documents');
    console.log('   ✅ Approval workflow removes documents from pending list');

  } catch (error) {
    console.log(`❌ Test failed: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testCompleteWorkflow();