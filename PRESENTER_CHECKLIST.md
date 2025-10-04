# 🎯 PRESENTER SETUP CHECKLIST

## ✅ What You Need to Install (5 minutes)

### 1. Node.js (Required)
- Download: https://nodejs.org/
- Install version 16 or higher
- Verify: Open terminal and run `node --version`

### 2. MySQL (Required)
- **Windows**: Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- **macOS**: Run `brew install mysql` or download from MySQL website
- **Linux**: Run `sudo apt-get install mysql-server`
- Remember your MySQL root password!

### 3. Git (Required)
- Download: https://git-scm.com/downloads
- Verify: Run `git --version` in terminal

## 🚀 Setup Options

### Option A: Automated Setup (Easiest)
```bash
git clone https://github.com/yashp62/coep-document-portal.git
cd coep-document-portal
./setup-demo.sh
```
**This creates a fresh database and user automatically**

### Option B: Use Your Existing MySQL
1. Clone the repository
2. Create database manually:
   ```sql
   mysql -u root -p
   CREATE DATABASE coep_document_portal;
   ```
3. Edit `backend/.env` with your MySQL root credentials
4. Run migrations: `cd backend && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all`

**Note**: If you get a validation error, try running the migrations and seeding separately:
```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

If seeding still fails, you can manually create a super admin user:
```sql
mysql -u root -p
USE coep_document_portal;
INSERT INTO users (email, password_hash, role, first_name, last_name, designation, is_active, created_at, updated_at) 
VALUES ('admin@coep.ac.in', '$2a$12$LQv3c1yqBw2LeOGQZ6mO.OVrWEVSHGvMLgXy1N8nHQ6VZ4XHWD1Nq', 'super_admin', 'Admin', 'User', 'Administrator', 1, NOW(), NOW());
```
(Password: admin123)

## 🔐 Database Credentials (Local Only)

The app will use **LOCAL** database credentials:
```
Host: localhost (your machine)
Database: coep_document_portal
User: admin (created by setup script) OR your mysql root user
Password: admin123 (created by setup script) OR your mysql root password
```

## ⚠️ Important Notes

- **No external accounts needed** (GitHub, cloud services, etc.)
- **Database runs locally** on your machine
- **Credentials are machine-specific** - each person creates their own
- **Total setup time**: 10 minutes including downloads

## 🎬 After Setup

Start the demo with two terminals:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

Demo URL: http://localhost:5173

## 🆘 Common Issues

1. **MySQL not starting**: Check if MySQL service is running
2. **Permission denied**: Make sure you have admin rights for installations
3. **Port conflicts**: Frontend will auto-increment port if 5173 is busy
4. **Database connection**: Verify MySQL credentials in backend/.env