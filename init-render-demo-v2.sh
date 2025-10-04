#!/bin/bash

echo "🚀 Initializing COEP Document Portal Demo on Render..."
echo "=================================================="

BACKEND_URL="https://coep-backend.onrender.com"
FRONTEND_URL="https://coep-frontend.onrender.com"

echo ""
echo "📡 Checking Backend Health..."
curl -s "${BACKEND_URL}/health" | jq .

echo ""
echo "🔍 Checking Database Connection..."
curl -s "${BACKEND_URL}/db/health" | jq .

echo ""
echo "📊 Checking Current Database Status..."
curl -s "${BACKEND_URL}/api/init/status" | jq .

echo ""
echo "🏗️  Creating Database Tables..."
curl -s -X POST "${BACKEND_URL}/api/init/create-tables" | jq .

echo ""
echo "📊 Checking Database Status After Table Creation..."
curl -s "${BACKEND_URL}/api/init/status" | jq .

echo ""
echo "🌱 Initializing Demo Data..."
curl -s -X POST "${BACKEND_URL}/api/init" | jq .

echo ""
echo "✅ Final Status Check..."
curl -s "${BACKEND_URL}/api/init/status" | jq .

echo ""
echo "🌐 Your Demo URLs:"
echo "Frontend: ${FRONTEND_URL}"
echo "Backend:  ${BACKEND_URL}"
echo ""
echo "👤 Demo Login Credentials:"
echo "Super Admin: superadmin@coep.ac.in / superadmin123"
echo "Admin:       admin@coep.ac.in / admin123" 
echo "Sub Admin:   subadmin@coep.ac.in / admin123"
echo ""
echo "🎉 Demo initialization complete!"