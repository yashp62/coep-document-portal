#!/usr/bin/env node

// Simple test script to validate the document approval workflow
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test data
const adminUser = {
  email: 'admin.examinations@coep.ac.in',
  password: 'admin123'
};

const subAdminUser = {
  email: 'subadmin.exam1@coep.ac.in',
  password: 'subadmin123'
};

async function testDocumentApprovalWorkflow() {
  console.log('🧪 Testing Document Approval Workflow\n');

  try {
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, adminUser);
    const adminToken = adminLogin.data.data.token;
    console.log('✅ Admin login successful');

    // 2. Login as sub-admin
    console.log('2. Logging in as sub-admin...');
    const subAdminLogin = await axios.post(`${BASE_URL}/api/auth/login`, subAdminUser);
    const subAdminToken = subAdminLogin.data.data.token;
    console.log('✅ Sub-admin login successful');

    // 3. Check pending documents for admin (should be empty initially)
    console.log('3. Checking pending documents for admin...');
    try {
      const pendingDocs = await axios.get(`${BASE_URL}/api/admin/documents/pending`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Found ${pendingDocs.data.data.documents.length} pending documents`);
    } catch (error) {
      console.log(`📋 Pending documents endpoint: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
    }

    // 4. Create a sample document as sub-admin (this should create a pending document)
    console.log('4. Creating a test document as sub-admin...');
    
    // Create form data for file upload
    const FormData = require('form-data');
    const fs = require('fs');
    
    // Create a temporary test PDF file (simple text file for testing)
    const testFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Document) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000015 00000 n \n0000000068 00000 n \n0000000125 00000 n \n0000000283 00000 n \n0000000364 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n456\n%%EOF';
    fs.writeFileSync('/tmp/test-document.pdf', testFileContent);
    
    const formData = new FormData();
    formData.append('title', 'Test Document for Approval');
    formData.append('description', 'This document should require admin approval');
    formData.append('file', fs.createReadStream('/tmp/test-document.pdf'), {
      filename: 'test-document.pdf',
      contentType: 'application/pdf'
    });

    try {
      const uploadResult = await axios.post(`${BASE_URL}/api/sub-admin/documents`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${subAdminToken}`
        }
      });
      console.log('✅ Document uploaded successfully by sub-admin');
      console.log(`📄 Document ID: ${uploadResult.data.data.document.id}`);
      console.log(`📊 Status: ${uploadResult.data.data.document.approval_status}`);
      
      const documentId = uploadResult.data.data.document.id;

      // 5. Check pending documents again (should have 1 document now)
      console.log('5. Checking pending documents after upload...');
      const pendingDocsAfter = await axios.get(`${BASE_URL}/api/admin/documents/pending`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Found ${pendingDocsAfter.data.data.documents.length} pending document(s)`);

      if (pendingDocsAfter.data.data.documents.length > 0) {
        // 6. Approve the document as admin
        console.log('6. Approving document as admin...');
        const approvalResult = await axios.post(`${BASE_URL}/api/admin/documents/${documentId}/approve`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Document approved successfully');

        // 7. Verify the document is now public
        console.log('7. Checking if document is now public...');
        const publicDocs = await axios.get(`${BASE_URL}/api/documents`);
        const approvedDoc = publicDocs.data.data.documents.find(doc => doc.id === documentId);
        
        if (approvedDoc) {
          console.log('✅ Document is now visible in public documents');
          console.log(`📊 Final status: ${approvedDoc.approval_status}`);
        } else {
          console.log('❌ Document not found in public documents');
        }

        // 8. Check pending documents again (should be empty)
        console.log('8. Checking pending documents after approval...');
        const pendingDocsFinal = await axios.get(`${BASE_URL}/api/admin/documents/pending`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Found ${pendingDocsFinal.data.data.documents.length} pending document(s)`);
      }

    } catch (uploadError) {
      console.log(`❌ Document upload failed: ${uploadError.response?.status || 'Error'} - ${uploadError.response?.data?.message || uploadError.message}`);
      if (uploadError.response?.data) {
        console.log('Full error response:', JSON.stringify(uploadError.response.data, null, 2));
      }
    }

    // Cleanup
    try {
      fs.unlinkSync('/tmp/test-document.pdf');
    } catch (e) {
      // File might not exist, ignore
    }
    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.log(`❌ Test failed: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
  }
}

// Run the test
testDocumentApprovalWorkflow();