# 🎯 SIMPLE SETUP - No Git Required

## 📥 Download & Setup (2 Steps)

### Step 1: Download Project
1. Go to: **https://github.com/yashp62/coep-document-portal**
2. Click green **"Code"** button
3. Click **"Download ZIP"**
4. Extract ZIP to Desktop/Documents

### Step 2: Run Setup
```bash
# Open terminal in extracted folder
cd coep-document-portal-main

# Run setup (choose one):
./setup-demo-zip.sh     # (if script works)
# OR manual setup below
```

## 🛠️ Manual Setup (If Script Fails)

### Install Dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Create .env Files:

**backend/.env:**
```
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
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:5000
```

### Setup Database:
```sql
mysql -u root -p

CREATE DATABASE coep_document_portal;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON coep_document_portal.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Run Migrations:
```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## 🚀 Start Demo
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

**Demo URL:** http://localhost:5173  
**Login:** admin@coep.ac.in / admin123

## 📋 What You Need Installed:
- Node.js 16+ (https://nodejs.org/)
- MySQL 8.0+ (https://dev.mysql.com/downloads/)

**No Git Required!** ✅