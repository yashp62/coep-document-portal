#!/usr/bin/env node

const axios = require('axios')

console.log('🔍 Testing exact API response structure...\n')

async function testResponseStructure() {
  try {
    // Test direct axios call to see raw response
    console.log('1. Testing direct axios call...')
    const directResponse = await axios.get('http://localhost:3001/api/documents')
    console.log('Direct axios response structure:')
    console.log('- directResponse.data:', JSON.stringify(directResponse.data, null, 2))
    console.log('')

    // Test what documentService.getDocuments actually returns
    console.log('2. Testing documentService.getDocuments...')
    
    // Import the documentService
    const path = require('path')
    const apiPath = path.join(__dirname, 'frontend/src/services/api.js')
    const documentServicePath = path.join(__dirname, 'frontend/src/services/documentService.js')
    
    // We need to check what the documentService actually returns
    console.log('📁 Checking documentService implementation...')
    const fs = require('fs')
    const documentServiceContent = fs.readFileSync(documentServicePath, 'utf8')
    
    // Find the getDocuments function
    const getDocumentsMatch = documentServiceContent.match(/getDocuments:\s*async\s*\([^)]*\)\s*=>\s*\{([^}]+return[^}]+)\}/s)
    if (getDocumentsMatch) {
      console.log('📋 documentService.getDocuments implementation:')
      console.log(getDocumentsMatch[0])
      console.log('')
    }
    
    // Check the api.js file to see what api.get returns
    const apiContent = fs.readFileSync(apiPath, 'utf8')
    const apiGetMatch = apiContent.match(/api\.get[^}]+/s)
    if (apiGetMatch) {
      console.log('📋 api.get implementation pattern found')
      console.log('')
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message)
  }
}

testResponseStructure()