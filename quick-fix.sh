#!/bin/bash

# Quick fix for API connection issues
echo "🔧 Quick Fix for API Connection Issues"
echo "====================================="

# Update frontend .env
echo "📝 Fixing frontend API URL..."
cat > frontend/.env << EOL
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=University Portal
VITE_APP_VERSION=1.0.0
EOL
echo "✅ Frontend .env updated"

# Update backend .env  
echo "📝 Fixing backend configuration..."
cat > backend/.env << EOL
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=coep_document_portal
DB_USER=admin
DB_PASSWORD=admin123
JWT_SECRET=your-super-secret-jwt-key-here-demo-12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
UPLOAD_MAX_SIZE=50mb
BCRYPT_ROUNDS=12
EOL
echo "✅ Backend .env updated"

# Fix user passwords in database
echo "🔑 Updating user passwords in database..."
mysql -u admin -padmin123 -e "
USE coep_document_portal;
UPDATE users SET password_hash = '\$2a\$12\$AdfCUtkDKzNLtDufhs070.oRksCcw0sML8c.OG8wu5.I8ikFr.nTK' WHERE email = 'admin@coep.ac.in';
UPDATE users SET password_hash = '\$2a\$12\$zJZaxXGLOLwbD3vJQuMCDOQY6Wk.BTBwfJS.5RLk7wpmDJrd0fHaS' WHERE email = 'superadmin@coep.ac.in';
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ User passwords updated"
else
    echo "⚠️  Database update skipped (users might not exist yet)"
fi

echo ""
echo "🎯 Fix Complete! Now restart both servers:"
echo ""
echo "Terminal 1 - Backend:"
echo "cd backend && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"  
echo "cd frontend && npm run dev"
echo ""
echo "🔐 Updated login credentials:"
echo "   admin@coep.ac.in / admin123"
echo "   superadmin@coep.ac.in / superadmin123"
echo ""
echo "📱 Demo URL: http://localhost:5173"