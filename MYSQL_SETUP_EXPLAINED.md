# 🔒 MySQL Setup Options for Presenter

## ❌ Why Your MySQL Credentials Won't Work

Your MySQL credentials are **local to your machine only**:
- MySQL server runs on `localhost` (127.0.0.1)
- Database users are created **per MySQL installation**
- Each machine has its own MySQL instance

## ✅ Two Setup Options for Presenter

### Option 1: Fresh MySQL Setup (Recommended)
```bash
# Our setup script creates:
Database: coep_document_portal
User: admin  
Password: admin123
Host: localhost
```

**Advantages:**
- ✅ Clean, isolated setup
- ✅ No conflicts with existing databases
- ✅ Consistent across all machines
- ✅ Easy to remember credentials

### Option 2: Use Existing MySQL Root
```bash
# Presenter uses their own MySQL root:
Database: coep_document_portal
User: root
Password: [their MySQL root password]
Host: localhost
```

**When to use:**
- Presenter already has MySQL configured
- They prefer using existing setup
- They're comfortable with MySQL administration

## 🛠️ Setup Commands for Each Option

### Option 1: Our Automated Setup
```bash
git clone https://github.com/yashp62/coep-document-portal.git
cd coep-document-portal
./setup-demo.sh
# Script handles everything automatically
```

### Option 2: Manual with Root User
```bash
git clone https://github.com/yashp62/coep-document-portal.git
cd coep-document-portal

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Create database
mysql -u root -p
CREATE DATABASE coep_document_portal;
EXIT;

# Edit backend/.env file:
DB_USER=root
DB_PASSWORD=[their root password]
DB_HOST=localhost
DB_NAME=coep_document_portal

# Run migrations
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## 🎯 Recommendation

**Use Option 1 (Automated Setup)** because:
- Presenter doesn't need to know their MySQL root password
- Creates isolated environment for demo
- Consistent setup across different machines
- Handles all edge cases automatically

## 📋 What to Share with Presenter

Send them:
1. **Repository link**: https://github.com/yashp62/coep-document-portal
2. **Setup guide**: PRESENTER_CHECKLIST.md
3. **One-liner**: `./setup-demo.sh` handles everything

**No need to share your MySQL credentials** - they won't work on their machine anyway!