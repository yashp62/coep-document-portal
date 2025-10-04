# 🚀 Manual Render Deployment Guide - COEP Document Portal

Since the Blueprint deployment is having issues, let's deploy manually. This is actually faster and gives you more control!

## Step 1: Create PostgreSQL Database (2 minutes)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. **Database Name**: `coep-document-portal-db`
4. **Database**: `coep_document_portal`
5. **User**: `admin` (or leave default)
6. **Region**: `Oregon (US West)`
7. **Plan**: `Free`
8. Click **"Create Database"**

**Save these details** (you'll need them for the backend):
- **Internal Database URL**: (copy from database dashboard)
- **External Database URL**: (copy from database dashboard)

---

## Step 2: Deploy Backend API (3 minutes)

1. Click **"New +"** → **"Web Service"**
2. **Connect Repository**: Select `coep-document-portal`
3. **Name**: `coep-backend`
4. **Region**: `Oregon (US West)`
5. **Branch**: `main`
6. **Runtime**: `Node`
7. **Build Command**:
   ```bash
   cd backend && npm install
   ```
8. **Start Command**:
   ```bash
   cd backend && npm start
   ```
9. **Plan**: `Free`

### Environment Variables for Backend:
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-123456789
JWT_EXPIRES_IN=7d
DATABASE_URL=[paste the Internal Database URL from Step 1]
CORS_ORIGIN=https://coep-frontend.onrender.com
UPLOAD_MAX_SIZE=50mb
BCRYPT_ROUNDS=12
```

10. **Add Health Check**: `/health`
11. Click **"Create Web Service"**

---

## Step 3: Run Database Migrations (1 minute)

After backend deployment completes:

1. Go to your backend service dashboard
2. Click **"Shell"** tab
3. Run these commands one by one:
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

---

## Step 4: Deploy Frontend (2 minutes)

1. Click **"New +"** → **"Static Site"**
2. **Connect Repository**: Select `coep-document-portal`
3. **Name**: `coep-frontend`
4. **Region**: `Oregon (US West)`
5. **Branch**: `main`
6. **Build Command**:
   ```bash
   cd frontend && npm install && npm run build
   ```
7. **Publish Directory**: `frontend/dist`

### Environment Variables for Frontend:
```
VITE_API_URL=https://coep-backend.onrender.com
```

8. Click **"Create Static Site"**

---

## 🎉 Your App Will Be Live At:

- **Frontend**: https://coep-frontend.onrender.com
- **Backend**: https://coep-backend.onrender.com

## 🔐 Demo Login Credentials:

- **Email**: admin@coep.ac.in
- **Password**: admin123

---

## ⚡ Quick Troubleshooting:

### If Backend Fails:
- Check environment variables are set correctly
- Ensure DATABASE_URL is the **Internal** URL from your PostgreSQL database
- Check build logs for npm install errors

### If Frontend Fails:
- Ensure VITE_API_URL points to your backend URL
- Check that backend is running first

### If Database Connection Fails:
- Use the **Internal Database URL** for DATABASE_URL (not external)
- Ensure database is in the same region as your backend

---

## 🎯 Total Deployment Time: ~8 minutes

This manual approach is actually more reliable than Blueprint deployment and gives you better control over each service!