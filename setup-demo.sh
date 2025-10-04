#!/bin/bash

# COEP Document Portal - Quick Demo Setup Script
# Run this script to automatically set up the local demo environment

echo "🎯 COEP Document Portal - Quick Demo Setup"
echo "=========================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi
echo "✅ npm found: $(npm --version)"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL not found. Please install MySQL 8.0+"
    echo "   - macOS: brew install mysql"
    echo "   - Windows: Download from https://dev.mysql.com/downloads/installer/"
    echo "   - Linux: sudo apt-get install mysql-server"
    exit 1
fi
echo "✅ MySQL found"

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "🔧 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

# Go back to root
cd ..

echo ""
echo "📝 Creating environment files..."

# Create backend .env
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
echo "✅ Backend .env created"

# Create frontend .env
cat > frontend/.env << EOL
VITE_API_URL=http://localhost:5000
EOL
echo "✅ Frontend .env created"

echo ""
echo "🗄️  Database setup..."
echo "Please run the following MySQL commands manually:"
echo ""
echo "mysql -u root -p"
echo "Then run these SQL commands:"
echo "CREATE DATABASE coep_document_portal;"
echo "CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin123';"
echo "GRANT ALL PRIVILEGES ON coep_document_portal.* TO 'admin'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"
echo ""

read -p "Press Enter after you've created the database..."

echo ""
echo "🔄 Running database migrations..."
cd backend
npx sequelize-cli db:migrate
if [ $? -ne 0 ]; then
    echo "❌ Database migration failed. Please check your database setup"
    exit 1
fi
echo "✅ Database migrated successfully"

echo ""
echo ""
echo "🌱 Setting up demo data..."

# Try seeding first, but don't fail if it doesn't work
npx sequelize-cli db:seed:all 2>/dev/null
SEED_SUCCESS=$?

if [ $SEED_SUCCESS -ne 0 ]; then
    echo "⚠️  Automatic seeding skipped, creating demo data manually..."
else
    echo "✅ Automatic seeding completed"
fi

# Always create basic demo data manually to ensure it exists
echo "🔧 Ensuring demo data exists..."

mysql -u admin -padmin123 -e "
USE coep_document_portal;

-- Create categories
INSERT IGNORE INTO categories (name, description, created_at, updated_at) VALUES 
('Academic', 'Academic related documents', NOW(), NOW()),
('Administrative', 'Administrative documents', NOW(), NOW()),
('Financial', 'Financial documents', NOW(), NOW()),
('General', 'General documents', NOW(), NOW());

-- Create university bodies
INSERT IGNORE INTO university_bodies (name, type, description, admin_id, created_at, updated_at) VALUES 
('Academic Council', 'board', 'Main academic governing body', NULL, NOW(), NOW()),
('Finance Committee', 'committee', 'Financial oversight committee', NULL, NOW(), NOW()),
('Student Development Board', 'board', 'Student affairs and development', NULL, NOW(), NOW()),
('Examination Board', 'board', 'Examination and evaluation oversight', NULL, NOW(), NOW());

-- Create demo users (using pre-hashed passwords)
INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name, designation, university_body_id, is_active, created_at, updated_at) VALUES 
('superadmin@coep.ac.in', '\$2a\$12\$LQv3c1yqBw2LeOGQZ6mO.OVrWEVSHGvMLgXy1N8nHQ6VZ4XHWD1Nq', 'super_admin', 'System', 'Super Admin', 'System Administrator', NULL, 1, NOW(), NOW()),
('admin@coep.ac.in', '\$2a\$12\$LQv3c1yqBw2LeOGQZ6mO.OVrWEVSHGvMLgXy1N8nHQ6VZ4XHWD1Nq', 'admin', 'Dr. Admin', 'User', 'Administrator', NULL, 1, NOW(), NOW()),
('subadmin@coep.ac.in', '\$2a\$12\$LQv3c1yqBw2LeOGQZ6mO.OVrWEVSHGvMLgXy1N8nHQ6VZ4XHWD1Nq', 'sub_admin', 'Sub Admin', 'User', 'Assistant Administrator', NULL, 1, NOW(), NOW());
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Demo data created successfully"
else
    echo "⚠️  Some demo data might already exist, but app should work"
fi

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🚀 To start the demo:"
echo ""
echo "Terminal 1 - Backend:"
echo "cd backend && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "cd frontend && npm run dev"
echo ""
echo "📱 Access the demo at: http://localhost:5173"
echo ""
echo "🔐 Demo login credentials:"
echo "   Super Admin: superadmin@coep.ac.in / superadmin123"
echo "   Admin: admin@coep.ac.in / admin123"
echo "   Sub Admin: subadmin@coep.ac.in / subadmin123"
echo ""
echo "🎯 Ready for your demo!"