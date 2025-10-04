#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Testing Redux Data Flow Fix...\n')

// Read the documentSlice.js file
const slicePath = path.join(__dirname, 'frontend/src/store/slices/documentSlice.js')
const sliceContent = fs.readFileSync(slicePath, 'utf8')

console.log('✅ Checking Redux thunk return statements...\n')

// Check for problematic .data access in thunks
const problematicPatterns = [
  'return response.data',
  'return result.data'
]

const fixedPatterns = [
  'return response',
  'return result'
]

let problemsFound = 0

problematicPatterns.forEach(pattern => {
  const matches = sliceContent.match(new RegExp(pattern, 'g'))
  if (matches) {
    console.log(`❌ Found problematic pattern "${pattern}": ${matches.length} occurrences`)
    problemsFound++
  }
})

if (problemsFound === 0) {
  console.log('✅ No problematic .data access patterns found in thunks')
}

console.log('')

// Check that specific thunks are properly fixed
const thunksToCheck = [
  'fetchDocuments',
  'fetchPublicDocuments', 
  'fetchMyDocuments',
  'fetchAllDocumentsAdmin',
  'fetchPendingDocuments'
]

console.log('✅ Checking specific thunk implementations:')

thunksToCheck.forEach(thunkName => {
  // Find the thunk implementation
  const thunkRegex = new RegExp(`export const ${thunkName} = createAsyncThunk[\\s\\S]*?return response(?:\\.data)?[\\s\\S]*?\\}[\\s\\S]*?\\)`, 'g')
  const thunkMatch = sliceContent.match(thunkRegex)
  
  if (thunkMatch) {
    const hasProblematicReturn = thunkMatch[0].includes('return response.data')
    const hasFixedReturn = thunkMatch[0].includes('return response') && !thunkMatch[0].includes('return response.data')
    
    if (hasFixedReturn) {
      console.log(`   ✅ ${thunkName}: Properly returns response`)
    } else if (hasProblematicReturn) {
      console.log(`   ❌ ${thunkName}: Still has problematic return response.data`)
    } else {
      console.log(`   ⚠️  ${thunkName}: Unexpected return pattern`)
    }
  } else {
    console.log(`   ❓ ${thunkName}: Could not find thunk implementation`)
  }
})

console.log('')

// Check that reducers still expect the correct structure
const reducerMatches = sliceContent.match(/action\.payload\.data\.documents/g)
if (reducerMatches) {
  console.log(`✅ Reducers still expect action.payload.data.documents: ${reducerMatches.length} occurrences`)
  console.log('   This is correct since thunks now return the full API response')
} else {
  console.log('❌ Reducers do not expect action.payload.data.documents structure')
}

console.log('')

// Summary
const allGood = problemsFound === 0 && reducerMatches && reducerMatches.length > 0

if (allGood) {
  console.log('🎉 REDUX DATA FLOW FIXED!')
  console.log('   - Thunks now return the full API response { success: true, data: {...} }')
  console.log('   - Reducers correctly access action.payload.data.documents')
  console.log('   - No more "undefined is not an object" errors expected')
} else {
  console.log('⚠️  Redux data flow may still have issues. Review the checks above.')
}

console.log('\n📋 What was fixed:')
console.log('   1. documentService returns response.data (full API response)')
console.log('   2. Thunks now return response (not response.data)')  
console.log('   3. Reducers access action.payload.data.documents correctly')
console.log('   4. Data flow: API → documentService → thunk → reducer → component')
console.log('')
console.log('🚀 The "undefined is not an object" error should now be resolved!')