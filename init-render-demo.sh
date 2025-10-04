#!/bin/bash

# Initialize Render Demo Data
echo "🚀 Initializing Demo Data on Render"
echo "===================================="

BACKEND_URL="https://coep-backend.onrender.com"

# Check if backend is healthy
echo "🔍 Checking backend health..."
curl -s "$BACKEND_URL/health" | grep -q "OK"
if [ $? -ne 0 ]; then
    echo "❌ Backend not responding. Please wait for deployment to complete."
    echo "   Try: $BACKEND_URL/health"
    exit 1
fi
echo "✅ Backend is healthy"

# Check current database status
echo ""
echo "📊 Checking current database status..."
STATUS=$(curl -s "$BACKEND_URL/api/init/status")
echo "Current status: $STATUS"

# Initialize database
echo ""
echo "🌱 Initializing demo data..."
RESULT=$(curl -X POST -s "$BACKEND_URL/api/init" -H "Content-Type: application/json")
echo "Initialization result: $RESULT"

# Verify initialization
echo ""
echo "✅ Verifying demo data..."
FINAL_STATUS=$(curl -s "$BACKEND_URL/api/init/status")
echo "Final status: $FINAL_STATUS"

echo ""
echo "🎉 Demo data initialization complete!"
echo "====================================="
echo ""
echo "🔐 Login credentials:"
echo "   Super Admin: superadmin@coep.ac.in / superadmin123"
echo "   Admin: admin@coep.ac.in / admin123"
echo "   Sub Admin: subadmin@coep.ac.in / admin123"
echo ""
echo "🌐 Your live demo:"
echo "   Frontend: https://coep-frontend.onrender.com"
echo "   Backend:  https://coep-backend.onrender.com"
echo ""
echo "🎯 Ready for demo presentation!"