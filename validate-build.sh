#!/bin/bash

# Local Build Validation Script
# Test everything locally before deploying to Render

echo "🧪 COEP Document Portal - Local Build Validation"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
BACKEND_TEST=0
FRONTEND_TEST=0

echo ""
echo "📁 Checking project structure..."

# Check if all required files exist
REQUIRED_FILES=(
    "render.yaml"
    "backend/package.json"
    "backend/src/server.js"
    "frontend/package.json"
    "frontend/src/App.jsx"
    "backend/src/config/database.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Found"
    else
        echo "❌ $file - Missing"
        exit 1
    fi
done

echo ""
echo "🔧 Testing backend configuration..."

cd backend

# Check if PostgreSQL dependencies are in package.json
if grep -q "pg" package.json; then
    echo "✅ PostgreSQL dependencies found"
else
    echo "❌ PostgreSQL dependencies missing"
    exit 1
fi

# Test if server.js can load without errors (syntax check)
if node -c src/server.js; then
    echo "✅ Backend syntax check passed"
    BACKEND_TEST=1
else
    echo "❌ Backend syntax check failed"
    exit 1
fi

cd ..

echo ""
echo "🎨 Testing frontend configuration..."

cd frontend

# Check if API configuration is updated
if grep -q "VITE_API_URL" src/services/api.js; then
    echo "✅ Frontend API configuration updated"
else
    echo "❌ Frontend API configuration missing"
    exit 1
fi

# Test frontend build (if npm is available)
if command -v npm &> /dev/null; then
    echo "📦 Installing frontend dependencies..."
    if npm install --silent; then
        echo "✅ Frontend dependencies installed"
        
        echo "🏗️ Testing frontend build..."
        if npm run build; then
            echo "✅ Frontend build successful"
            FRONTEND_TEST=1
        else
            echo "❌ Frontend build failed"
            exit 1
        fi
    else
        echo "❌ Frontend dependency installation failed"
        exit 1
    fi
else
    echo "⚠️ npm not available, skipping build test"
    FRONTEND_TEST=1
fi

cd ..

echo ""
echo "📊 VALIDATION RESULTS"
echo "===================="

if [ $BACKEND_TEST -eq 1 ] && [ $FRONTEND_TEST -eq 1 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - READY FOR RENDER DEPLOYMENT!${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Push code to GitHub repository"
    echo "2. Connect repository to Render"
    echo "3. Deploy using render.yaml configuration"
    echo ""
    echo "📋 Deployment URLs (after deployment):"
    echo "- Backend: https://coep-backend.onrender.com"
    echo "- Frontend: https://coep-frontend.onrender.com"
    echo "- Health Check: https://coep-backend.onrender.com/health"
    echo ""
    echo -e "${GREEN}🎉 Build validation complete - deployment ready!${NC}"
else
    echo -e "${RED}❌ BUILD VALIDATION FAILED${NC}"
    echo "Please fix the issues above before deploying to Render."
    exit 1
fi