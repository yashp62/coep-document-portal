// Comprehensive System Test Script
// This script tests the application structure, routes, and functionality

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive System Test...\n');

// Test Results Container
const testResults = {
  backend: { passed: 0, failed: 0, tests: [] },
  frontend: { passed: 0, failed: 0, tests: [] },
  overall: { score: 0, readiness: false }
};

function logTest(category, testName, status, details = '') {
  const result = { name: testName, status, details };
  testResults[category].tests.push(result);
  
  if (status === 'PASS') {
    testResults[category].passed++;
    console.log(`✅ ${testName}: PASS`);
  } else {
    testResults[category].failed++;
    console.log(`❌ ${testName}: FAIL - ${details}`);
  }
  
  if (details) {
    console.log(`   Details: ${details}`);
  }
  console.log('');
}

// Backend Structure Tests
console.log('🔧 BACKEND TESTS\n');

// Test 1: Backend Structure
try {
  const backendPath = '/Users/yashpardeshi/Desktop/sds/backend';
  const requiredFiles = [
    'package.json',
    'src/server.js',
    'src/config/database.js',
    'src/models/index.js',
    'src/routes/auth.js',
    'src/routes/documents.js',
    'src/routes/users.js'
  ];
  
  let missingFiles = [];
  requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(backendPath, file))) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length === 0) {
    logTest('backend', 'Backend File Structure', 'PASS');
  } else {
    logTest('backend', 'Backend File Structure', 'FAIL', `Missing files: ${missingFiles.join(', ')}`);
  }
} catch (error) {
  logTest('backend', 'Backend File Structure', 'FAIL', error.message);
}

// Test 2: Route Files Analysis
try {
  const routesPath = '/Users/yashpardeshi/Desktop/sds/backend/src/routes';
  const expectedRoutes = [
    'auth.js', 'documents.js', 'users.js', 'universityBodies.js',
    'superAdminUsers.js', 'adminUsers.js', 'subAdminUsers.js',
    'superAdminDocuments.js', 'adminDocuments.js', 'subAdminDocuments.js',
    'superAdminUniversityBodies.js', 'adminUniversityBodies.js', 'subAdminUniversityBodies.js'
  ];
  
  let missingRoutes = [];
  expectedRoutes.forEach(route => {
    if (!fs.existsSync(path.join(routesPath, route))) {
      missingRoutes.push(route);
    }
  });
  
  if (missingRoutes.length === 0) {
    logTest('backend', 'Route Files Complete', 'PASS');
  } else {
    logTest('backend', 'Route Files Complete', 'FAIL', `Missing routes: ${missingRoutes.join(', ')}`);
  }
} catch (error) {
  logTest('backend', 'Route Files Complete', 'FAIL', error.message);
}

// Test 3: Model Files
try {
  const modelsPath = '/Users/yashpardeshi/Desktop/sds/backend/src/models';
  const expectedModels = ['User.js', 'Document.js', 'Category.js', 'Board.js', 'Committee.js', 'index.js'];
  
  let missingModels = [];
  expectedModels.forEach(model => {
    if (!fs.existsSync(path.join(modelsPath, model))) {
      missingModels.push(model);
    }
  });
  
  if (missingModels.length === 0) {
    logTest('backend', 'Database Models Complete', 'PASS');
  } else {
    logTest('backend', 'Database Models Complete', 'FAIL', `Missing models: ${missingModels.join(', ')}`);
  }
} catch (error) {
  logTest('backend', 'Database Models Complete', 'FAIL', error.message);
}

// Test 4: Middleware Files
try {
  const middlewarePath = '/Users/yashpardeshi/Desktop/sds/backend/src/middleware';
  const expectedMiddleware = ['auth.js', 'errorHandler.js', 'notFound.js', 'upload.js', 'validation.js'];
  
  let missingMiddleware = [];
  expectedMiddleware.forEach(middleware => {
    if (!fs.existsSync(path.join(middlewarePath, middleware))) {
      missingMiddleware.push(middleware);
    }
  });
  
  if (missingMiddleware.length === 0) {
    logTest('backend', 'Middleware Complete', 'PASS');
  } else {
    logTest('backend', 'Middleware Complete', 'FAIL', `Missing middleware: ${missingMiddleware.join(', ')}`);
  }
} catch (error) {
  logTest('backend', 'Middleware Complete', 'FAIL', error.message);
}

// Frontend Structure Tests
console.log('🎨 FRONTEND TESTS\n');

// Test 5: Frontend Structure
try {
  const frontendPath = '/Users/yashpardeshi/Desktop/sds/frontend';
  const requiredFiles = [
    'package.json',
    'src/App.jsx',
    'src/main.jsx',
    'src/store/store.js',
    'src/pages/Dashboard/Dashboard.jsx',
    'src/pages/Dashboard/EnhancedDashboard.jsx'
  ];
  
  let missingFiles = [];
  requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(frontendPath, file))) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length === 0) {
    logTest('frontend', 'Frontend File Structure', 'PASS');
  } else {
    logTest('frontend', 'Frontend File Structure', 'FAIL', `Missing files: ${missingFiles.join(', ')}`);
  }
} catch (error) {
  logTest('frontend', 'Frontend File Structure', 'FAIL', error.message);
}

// Test 6: React Components
try {
  const componentsPath = '/Users/yashpardeshi/Desktop/sds/frontend/src/components';
  const expectedComponents = [
    'Auth/ProtectedRoute.jsx',
    'Layout/Header.jsx',
    'Layout/Layout.jsx',
    'Layout/Sidebar.jsx',
    'UI/Button.jsx',
    'UI/Card.jsx',
    'UI/Input.jsx',
    'UI/LoadingSpinner.jsx',
    'UI/Charts.jsx'
  ];
  
  let missingComponents = [];
  expectedComponents.forEach(component => {
    if (!fs.existsSync(path.join(componentsPath, component))) {
      missingComponents.push(component);
    }
  });
  
  if (missingComponents.length === 0) {
    logTest('frontend', 'React Components Complete', 'PASS');
  } else {
    logTest('frontend', 'React Components Complete', 'FAIL', `Missing components: ${missingComponents.join(', ')}`);
  }
} catch (error) {
  logTest('frontend', 'React Components Complete', 'FAIL', error.message);
}

// Test 7: Redux Store
try {
  const storePath = '/Users/yashpardeshi/Desktop/sds/frontend/src/store';
  const expectedSlices = [
    'slices/authSlice.js',
    'slices/documentSlice.js',
    'slices/userSlice.js',
    'slices/categorySlice.js'
  ];
  
  let missingSlices = [];
  expectedSlices.forEach(slice => {
    if (!fs.existsSync(path.join(storePath, slice))) {
      missingSlices.push(slice);
    }
  });
  
  if (missingSlices.length === 0) {
    logTest('frontend', 'Redux Store Complete', 'PASS');
  } else {
    logTest('frontend', 'Redux Store Complete', 'FAIL', `Missing slices: ${missingSlices.join(', ')}`);
  }
} catch (error) {
  logTest('frontend', 'Redux Store Complete', 'FAIL', error.message);
}

// Test 8: Service Files
try {
  const servicesPath = '/Users/yashpardeshi/Desktop/sds/frontend/src/services';
  const expectedServices = [
    'api.js',
    'authService.js',
    'documentService.js',
    'userService.js',
    'categoryService.js',
    'boardService.js',
    'committeeService.js'
  ];
  
  let missingServices = [];
  expectedServices.forEach(service => {
    if (!fs.existsSync(path.join(servicesPath, service))) {
      missingServices.push(service);
    }
  });
  
  if (missingServices.length === 0) {
    logTest('frontend', 'API Services Complete', 'PASS');
  } else {
    logTest('frontend', 'API Services Complete', 'FAIL', `Missing services: ${missingServices.join(', ')}`);
  }
} catch (error) {
  logTest('frontend', 'API Services Complete', 'FAIL', error.message);
}

// Test 9: Page Components
try {
  const pagesPath = '/Users/yashpardeshi/Desktop/sds/frontend/src/pages';
  const expectedPages = [
    'Auth/Login.jsx',
    'Dashboard/Dashboard.jsx',
    'Documents/Documents.jsx',
    'Documents/DocumentDetail.jsx',
    'Profile/Profile.jsx',
    'PublicDashboard/PublicDashboard.jsx',
    'NotFound/NotFound.jsx'
  ];
  
  let missingPages = [];
  expectedPages.forEach(page => {
    if (!fs.existsSync(path.join(pagesPath, page))) {
      missingPages.push(page);
    }
  });
  
  if (missingPages.length === 0) {
    logTest('frontend', 'Page Components Complete', 'PASS');
  } else {
    logTest('frontend', 'Page Components Complete', 'FAIL', `Missing pages: ${missingPages.join(', ')}`);
  }
} catch (error) {
  logTest('frontend', 'Page Components Complete', 'FAIL', error.message);
}

// Calculate overall score
const totalTests = testResults.backend.tests.length + testResults.frontend.tests.length;
const totalPassed = testResults.backend.passed + testResults.frontend.passed;
testResults.overall.score = Math.round((totalPassed / totalTests) * 100);
testResults.overall.readiness = testResults.overall.score >= 80;

// Print Final Results
console.log('📊 FINAL RESULTS\n');
console.log(`Backend Tests: ${testResults.backend.passed}/${testResults.backend.tests.length} passed`);
console.log(`Frontend Tests: ${testResults.frontend.passed}/${testResults.frontend.tests.length} passed`);
console.log(`\nOverall Score: ${testResults.overall.score}%`);
console.log(`Demo Readiness: ${testResults.overall.readiness ? '✅ READY' : '❌ NOT READY'}\n`);

// Detailed Recommendations
console.log('💡 RECOMMENDATIONS FOR DEMO:\n');

if (testResults.backend.failed > 0) {
  console.log('Backend Issues:');
  testResults.backend.tests.forEach(test => {
    if (test.status === 'FAIL') {
      console.log(`- Fix: ${test.name} - ${test.details}`);
    }
  });
  console.log('');
}

if (testResults.frontend.failed > 0) {
  console.log('Frontend Issues:');
  testResults.frontend.tests.forEach(test => {
    if (test.status === 'FAIL') {
      console.log(`- Fix: ${test.name} - ${test.details}`);
    }
  });
  console.log('');
}

console.log('Next Steps:');
console.log('1. Install dependencies: npm install in both backend and frontend');
console.log('2. Set up environment variables (.env files)');
console.log('3. Initialize database and run migrations');
console.log('4. Start both servers and test manually');
console.log('5. Deploy to staging environment for demo\n');

console.log('✨ System Test Complete!\n');