# 🚀 Setup Without Git - Alternative Methods

## 📥 Option 1: Download ZIP (Fastest - No Git Needed)

### Step 1: Download Project
1. Go to: https://github.com/yashp62/coep-document-portal
2. Click the green **"Code"** button
3. Select **"Download ZIP"**
4. Extract the ZIP file to your desired location
5. Open terminal/command prompt in the extracted folder

### Step 2: Setup (Same as before)
```bash
# Navigate to the project folder
cd coep-document-portal-main

# Run the setup script
./setup-demo.sh
```

---

## 🔧 Option 2: Install Git (Recommended for Future)

### Windows:
1. Download: https://git-scm.com/download/win
2. Run the installer with default settings
3. Restart terminal/command prompt

### macOS:
```bash
# Option A: Using Homebrew (if available)
brew install git

# Option B: Download installer
# Go to: https://git-scm.com/download/mac
```

### Linux:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

---

## 📱 Option 3: Manual Setup (No Downloads)

If the presenter can't download anything, you can share the project files manually:

### Step 1: Create Project Structure
```bash
mkdir coep-document-portal
cd coep-document-portal
```

### Step 2: I'll provide you with a complete project bundle
You can zip your local project and share it via:
- Email
- USB drive
- File sharing service (Google Drive, Dropbox)
- Local network transfer

---

## 🎯 Recommended Approach

### For Demo Presentation:
**Use Option 1 (Download ZIP)** because:
- ✅ No Git installation needed
- ✅ Fastest setup (2 clicks)
- ✅ Works on any machine
- ✅ No technical prerequisites

### Steps for Presenter:
1. **Download ZIP** from GitHub
2. **Extract** to Desktop or Documents
3. **Open terminal** in the project folder
4. **Run setup**: `./setup-demo.sh`
5. **Start demo** with two terminals

---

## 📋 Updated Presenter Instructions

Send this to your presenter:

```
🎯 COEP Document Portal - Demo Setup (No Git Required)

1. Go to: https://github.com/yashp62/coep-document-portal
2. Click "Code" → "Download ZIP"
3. Extract ZIP to Desktop
4. Install: Node.js + MySQL (if not installed)
5. Open terminal in extracted folder
6. Run: ./setup-demo.sh
7. Start demo with two terminals

Demo URL: http://localhost:5173
Login: admin@coep.ac.in / admin123
```

---

## 🆘 Troubleshooting Without Git

### If setup-demo.sh doesn't work:
```bash
# Manual setup commands:
cd backend
npm install
cd ../frontend  
npm install

# Create .env files manually (content provided in guides)
# Run database setup manually
```

### If they need the latest updates:
- They can re-download the ZIP anytime
- No need to "pull" changes like with Git

**The ZIP download method is actually simpler for one-time demos!** 🎊