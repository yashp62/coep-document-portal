# Installation Guide

This guide will help you set up the University Curriculum & Document Portal on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sds
```

### 2. Install Dependencies

Install all dependencies for both backend and frontend:

```bash
npm run install:all
```

Or install them separately:

```bash
# Backend dependencies
npm run install:backend

# Frontend dependencies
npm run install:frontend
```

### 3. Database Setup

#### Create MySQL Database

1. Start your MySQL server
2. Connect to MySQL as root:
   ```bash
   mysql -u root -p
   ```

3. Create the database:
   ```sql
   CREATE DATABASE dashboard;
   ```

4. Create a user (optional but recommended):
   ```sql
   CREATE USER 'university_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON dashboard.* TO 'university_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

#### Run Database Migrations

```bash
cd backend
npm run db:migrate
```

#### Seed Initial Data

```bash
cd backend
npm run db:seed
```

This will create:
- Default categories (Academic Programs, Administrative, Research, etc.)
- A super admin user (admin@university.edu / Admin123!)

### 4. Environment Configuration

#### Backend Environment

1. Copy the environment example file:
   ```bash
   cd backend
   cp env.example .env
   ```

2. Edit `.env` with your database credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   HOST=localhost

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=dashboard
   DB_USER=university_user
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png

   # Security Configuration
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

#### Frontend Environment

1. Copy the environment example file:
   ```bash
   cd frontend
   cp env.example .env
   ```

2. Edit `.env` if needed (default values should work for development):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=University Portal
   VITE_APP_VERSION=1.0.0
   ```

### 5. Start the Application

#### Development Mode

Start both backend and frontend in development mode:

```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:3000`

#### Or start them separately:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### 6. Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Login with the default super admin credentials:
   - **Email**: admin@university.edu
   - **Password**: Admin123!

**Important**: Change the default password immediately after first login!

## Docker Installation (Alternative)

If you prefer to use Docker:

### 1. Install Docker and Docker Compose

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 2. Start the Application

```bash
docker-compose up -d
```

This will start:
- MySQL database
- Backend API
- Frontend application

### 3. Access the Application

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- MySQL: `localhost:3306`

### 4. Stop the Application

```bash
docker-compose down
```

## Verification

### Backend Health Check

Visit `http://localhost:5000/health` to verify the backend is running.

### Database Connection

Check that the database connection is working by looking at the backend logs for:
```
✅ Database connection established successfully.
```

### Frontend

The frontend should load without errors and show the login page.

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

- Ensure MySQL is running
- Check database credentials in `.env`
- Verify the database exists
- Check if the user has proper permissions

#### 2. Port Already in Use

- Backend (5000): Change `PORT` in backend `.env`
- Frontend (3000): Vite will automatically use the next available port

#### 3. Migration Errors

- Ensure the database exists
- Check user permissions
- Try running migrations manually:
  ```bash
  cd backend
  npx sequelize-cli db:migrate
  ```

#### 4. Frontend Build Errors

- Clear node_modules and reinstall:
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  ```

#### 5. CORS Errors

- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running

### Logs

Check the console output for both backend and frontend for error messages.

### Database Issues

Connect to MySQL and check:
```sql
USE dashboard;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM categories;
```

## Next Steps

1. **Change Default Password**: Login and change the super admin password
2. **Create Users**: Use the super admin account to create additional users
3. **Upload Documents**: Test the document upload functionality
4. **Configure Categories**: Set up document categories for your organization

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed correctly
4. Verify environment configuration

## Security Notes

- Change all default passwords
- Use strong JWT secrets in production
- Configure proper CORS settings
- Set up HTTPS in production
- Regular database backups
- Keep dependencies updated
