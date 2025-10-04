# 🎯 COEP Document Portal - Local Demo Setup Guide

## 📋 Prerequisites (Must Have Installed)

### Required Software:
1. **Node.js** (version 16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` (should show v16+)

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **MySQL** (version 8.0 or higher)
   - **Windows**: Download MySQL Installer from https://dev.mysql.com/downloads/installer/
   - **macOS**: `brew install mysql` or download from MySQL website
   - **Linux**: `sudo apt-get install mysql-server`

4. **Git**
   - Download: https://git-scm.com/downloads
   - Verify: `git --version`

---

## 🚀 Quick Setup (10 minutes total)

### Step 1: Clone Repository (1 minute)
```bash
git clone https://github.com/yashp62/coep-document-portal.git
cd coep-document-portal
```

### Step 2: Setup Database (2 minutes)

#### Start MySQL Service:
- **Windows**: Start MySQL service from Services
- **macOS**: `brew services start mysql`
- **Linux**: `sudo systemctl start mysql`

#### Create Database:
```bash
mysql -u root -p
```
Then run:
```sql
CREATE DATABASE coep_document_portal;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON coep_document_portal.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Setup Backend (3 minutes)
```bash
cd backend
npm install
```

#### Create `.env` file:
```bash
# Copy and paste this into backend/.env
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

#### Run Migrations & Seed Data:
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Step 4: Setup Frontend (2 minutes)
```bash
cd ../frontend
npm install
```

#### Create `.env` file:
```bash
# Copy and paste this into frontend/.env
VITE_API_URL=http://localhost:5000
```

---

## 🎬 Running the Demo (2 minutes)

### Terminal 1 - Start Backend:
```bash
cd backend
npm run dev
```
**Wait for**: "Server running on port 5000" and "Database connected successfully"

### Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
```
**Wait for**: "Local: http://localhost:5173"

---

## 🎯 Demo Access

### Application URL:
```
http://localhost:5173
```

### Demo Login Credentials:

#### 1. Super Admin Account:
- **Email**: superadmin@coep.ac.in
- **Password**: superadmin123
- **Access**: Full system control, user management, all features

#### 2. Admin Account:
- **Email**: admin@coep.ac.in
- **Password**: admin123
- **Access**: Document management, board oversight, analytics

#### 3. Sub Admin Account:
- **Email**: subadmin@coep.ac.in
- **Password**: subadmin123
- **Access**: Basic document operations, limited analytics

---

## 🎊 Demo Features to Showcase

### 1. Dashboard Analytics
- **Role-based insights** with different data for each user type
- **Interactive charts** showing document trends
- **Quick action buttons** for common tasks
- **Real-time statistics** updated live

### 2. Document Management
- **Upload documents** with drag & drop
- **Document approval workflow** (Sub Admin → Admin → Super Admin)
- **Category-based organization** (Academic, Administrative, etc.)
- **Search and filter** functionality

### 3. User Management (Admin+ only)
- **Create/Edit users** with role assignment
- **Role-based permissions** demonstration
- **User activity tracking**

### 4. Board & Committee Management
- **COEP-specific boards** (Academic Council, Finance Committee, etc.)
- **Committee document assignment**
- **Hierarchical organization structure**

### 5. Responsive Design
- **Mobile-friendly** interface
- **Adaptive layouts** for different screen sizes
- **Touch-friendly** interactions

---

## 🛠️ Troubleshooting

### Database Connection Issues:
```bash
# Check MySQL is running
mysql -u root -p

# If password issues, reset:
ALTER USER 'admin'@'localhost' IDENTIFIED BY 'admin123';
```

### Port Conflicts:
- Frontend default: 5173 (will auto-increment if busy)
- Backend default: 5000
- If 5000 is busy, change PORT in backend/.env

### npm Install Errors:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Demo Script Suggestions

### 1. Login Flow (30 seconds)
- Show different login accounts
- Demonstrate role-based dashboard differences

### 2. Document Upload (1 minute)
- Upload a sample document
- Show approval workflow
- Demonstrate search functionality

### 3. Analytics Dashboard (1 minute)
- Show interactive charts
- Explain trend indicators
- Demonstrate quick actions

### 4. User Management (30 seconds)
- Create a new user (Admin account)
- Show role assignment
- Demonstrate permission differences

### 5. Responsive Design (30 seconds)
- Resize browser window
- Show mobile responsiveness
- Touch interactions on mobile devices

---

## 📞 Support During Demo

If any issues arise during the demo:

1. **Database not connecting**: Ensure MySQL is running and credentials are correct
2. **Frontend not loading**: Check that backend is running first
3. **Login not working**: Verify migrations and seeding completed successfully
4. **Features missing**: Ensure both frontend and backend are latest version from GitHub

---

## 🎉 Your Demo is Ready!

Total setup time: **~10 minutes**
Demo duration: **3-5 minutes**
Supported platforms: **Windows, macOS, Linux**

The application showcases a complete university document management system with:
- ✅ **Role-based authentication**
- ✅ **Advanced analytics dashboard**
- ✅ **Document workflow management**
- ✅ **Responsive design**
- ✅ **Real-time features**