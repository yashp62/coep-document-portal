# University Portal - Technical Documentation

## Project Overview

The University Portal is a comprehensive web application designed for managing university documents, university bodies, and user roles within an academic institution. The system implements a robust role-based access control system with three distinct user roles: Super Admin, Admin, and Sub Admin.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Requirements](#system-requirements)
4. [Installation & Setup](#installation--setup)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Role-Based Access Control](#role-based-access-control)
8. [Security Features](#security-features)
9. [Deployment](#deployment)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

## Architecture Overview

The University Portal follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (Node.js)     │◄──►│    (MySQL)      │
│                 │    │   Express.js    │    │                 │
│   - Redux       │    │   - JWT Auth    │    │   - Sequelize   │
│   - Tailwind    │    │   - Swagger     │    │   - Migrations  │
│   - Vite        │    │   - Multer      │    │   - Seeders     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- **Frontend**: React-based SPA with Redux state management
- **Backend**: RESTful API built with Express.js and Node.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT-based authentication system
- **Documentation**: Swagger UI for API documentation
- **File Upload**: Multer for document management

## Technology Stack

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express.js v4.18+
- **Database**: MySQL v8.0+
- **ORM**: Sequelize v6.35+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Security**: Helmet, CORS
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React v18+
- **Build Tool**: Vite v5+
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS v3+
- **Routing**: React Router v6+
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library

### Development Tools
- **Process Management**: PM2 (production)
- **Code Quality**: ESLint, Prettier
- **Database Management**: Sequelize CLI
- **Documentation**: Swagger UI

## System Requirements

### Development Environment
- Node.js v20.0.0 or higher
- npm v10.0.0 or higher
- MySQL v8.0 or higher
- Git v2.30.0 or higher

### Production Environment
- Ubuntu 20.04+ or CentOS 8+
- Node.js v20.0.0 or higher
- MySQL v8.0 or higher
- Nginx (recommended reverse proxy)
- SSL certificate for HTTPS

### Hardware Requirements
- **Minimum**: 2GB RAM, 20GB storage
- **Recommended**: 4GB RAM, 50GB storage
- **Production**: 8GB RAM, 100GB storage

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd university-portal
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure environment variables in .env
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE university_portal;

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
cp env.example .env
# Configure environment variables in .env
```

### 5. Start Development Servers
```bash
# Backend (Port 5001)
cd backend
npm run dev

# Frontend (Port 3000)
cd frontend
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=university_portal
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=University Portal
```

## Database Schema

### Tables Overview

#### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'sub_admin') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### University Bodies Table
```sql
CREATE TABLE university_bodies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Committee', 'Board') NOT NULL,
    description TEXT,
    admin_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);
```

#### Documents Table
```sql
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by_id INT NOT NULL,
    university_body_id INT,
    is_public BOOLEAN DEFAULT false,
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by_id INT,
    approved_at DATETIME,
    requested_at DATETIME,
    rejection_reason TEXT,
    download_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id),
    FOREIGN KEY (university_body_id) REFERENCES university_bodies(id),
    FOREIGN KEY (approved_by_id) REFERENCES users(id)
);
```

### Entity Relationships

```
Users (1) ─────── (M) Documents
  │                     │
  │                     │
  └── (1) ──── (M) UniversityBodies
               │
               │
               └── (1) ──── (M) Documents
```

## API Documentation

The API documentation is available via Swagger UI at: `http://localhost:5001/api-docs`

### Authentication Endpoints

#### POST /api/auth/login
- **Description**: Authenticate user and get JWT token
- **Body**: `{ email, password }`
- **Response**: `{ success, data: { token, user }, message }`

#### POST /api/auth/logout
- **Description**: Logout user (client-side token invalidation)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, message }`

#### GET /api/auth/me
- **Description**: Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, data: { user } }`

### Role-Based API Structure

The API implements separate endpoints for each role to ensure proper access control:

#### Super Admin Endpoints
- `GET /api/super-admin/users` - Get all users
- `POST /api/super-admin/users` - Create new user
- `PUT /api/super-admin/users/:id` - Update user
- `DELETE /api/super-admin/users/:id` - Delete user
- `GET /api/super-admin/documents` - Get all documents
- `POST /api/super-admin/documents` - Upload document (auto-approved)
- `PUT /api/super-admin/documents/:id/approve` - Approve document
- `PUT /api/super-admin/documents/:id/reject` - Reject document
- `GET /api/super-admin/university-bodies` - Get all university bodies
- `POST /api/super-admin/university-bodies` - Create university body
- `PUT /api/super-admin/university-bodies/:id` - Update university body
- `DELETE /api/super-admin/university-bodies/:id` - Delete university body

#### Admin Endpoints
- `GET /api/admin/users` - Get users (limited to admins and sub-admins)
- `POST /api/admin/users` - Create sub-admin user
- `GET /api/admin/documents` - Get own documents + public approved
- `POST /api/admin/documents` - Upload document (pending approval)
- `PUT /api/admin/documents/:id` - Update own document (24-hour rule)
- `DELETE /api/admin/documents/:id` - Delete own document (24-hour rule)
- `GET /api/admin/university-bodies` - Get active university bodies
- `PUT /api/admin/university-bodies/:id` - Update university body (limited)

#### Sub Admin Endpoints
- `GET /api/sub-admin/users` - Get other sub-admins
- `GET /api/sub-admin/users/profile` - Get own profile
- `PUT /api/sub-admin/users/profile` - Update own profile
- `GET /api/sub-admin/documents` - Get own documents + public approved
- `POST /api/sub-admin/documents` - Upload document (pending approval)
- `PUT /api/sub-admin/documents/:id` - Update own document (24-hour rule)
- `DELETE /api/sub-admin/documents/:id` - Delete own document (24-hour rule)
- `GET /api/sub-admin/university-bodies` - Get active university bodies (read-only)

#### Public Endpoints
- `GET /api/documents` - Get public approved documents
- `GET /api/documents/:id` - Get public document details
- `GET /api/documents/:id/download` - Download public document
- `GET /api/university-bodies` - Get active university bodies

## Role-Based Access Control

### User Roles

#### Super Admin
- **Full system access and control**
- Can manage all users, documents, and university bodies
- Can approve/reject documents
- No time restrictions on operations
- Can view all documents regardless of status

#### Admin
- **Limited administrative access**
- Can create sub-admin users
- Can manage own documents with 24-hour deletion rule
- Can view and limited update of university bodies
- Can see own documents + public approved documents

#### Sub Admin
- **Basic user access**
- Can only manage own profile
- Can manage own documents with 24-hour deletion rule
- Read-only access to university bodies
- Can view other sub-admins for collaboration

### Permission Matrix

| Feature | Super Admin | Admin | Sub Admin | Public |
|---------|-------------|-------|-----------|--------|
| User Management | Full | Limited | Own Profile | None |
| Document Approval | Yes | No | No | No |
| Document Upload | Yes | Yes | Yes | No |
| Document Delete | Anytime | 24h Rule | 24h Rule | No |
| University Bodies | Full CRUD | View + Limited Update | View Only | View Active |
| System Settings | Yes | No | No | No |

### 24-Hour Rule
- Admins and Sub-admins can only delete their own documents within 24 hours of upload
- After 24 hours, only Super Admin can delete documents
- This rule ensures document integrity and prevents accidental deletions

## Security Features

### Authentication & Authorization
- **JWT-based authentication** with configurable expiration
- **Role-based access control** with three distinct roles
- **Password hashing** using bcryptjs with salt rounds
- **Token validation** on protected endpoints

### Data Protection
- **Input validation** using Joi and express-validator
- **SQL injection prevention** through Sequelize ORM
- **XSS protection** via helmet middleware
- **CORS configuration** for cross-origin requests

### File Upload Security
- **File type validation** (PDF, DOC, DOCX only)
- **File size limits** (configurable, default 10MB)
- **Secure file storage** outside web root
- **Malware scanning** ready integration points

### API Security
- **Rate limiting** (configurable)
- **Request size limits** to prevent DoS
- **Security headers** via Helmet
- **Error handling** without information leakage

## Deployment

### Production Setup

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx
```

#### 2. Application Deployment
```bash
# Clone and setup application
git clone <repository-url> /var/www/university-portal
cd /var/www/university-portal

# Install dependencies
npm install --production

# Setup environment
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
# Configure production environment variables

# Build frontend
cd frontend
npm run build

# Setup database
cd ../backend
npm run db:migrate
```

#### 3. Process Management
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name "university-portal"
pm2 startup
pm2 save
```

#### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/university-portal/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 5. SSL Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Docker Deployment

#### Dockerfile (Backend)
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: mysql
    depends_on:
      - mysql
    ports:
      - "5001:5001"
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

## Testing

### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js

# Watch mode
npm run test:watch
```

### Frontend Testing
```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- Button.test.jsx
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:5001/health

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"password"}'

# Test protected endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:5001/api/super-admin/users
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check MySQL service
sudo systemctl status mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Verify credentials
mysql -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_NAME}
```

#### File Upload Issues
```bash
# Check upload directory permissions
ls -la uploads/
chmod 755 uploads/

# Check disk space
df -h

# Check file size limits
grep -i "client_max_body_size" /etc/nginx/nginx.conf
```

#### JWT Token Issues
```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token expiration
# Decode JWT token at https://jwt.io

# Clear browser storage
# Application → Storage → Local Storage → Clear
```

#### Performance Issues
```bash
# Check system resources
htop
df -h

# Monitor API response times
tail -f /var/log/nginx/access.log

# Check database performance
mysql -e "SHOW PROCESSLIST;"
```

### Log Files
- **Application Logs**: `backend/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **MySQL Logs**: `/var/log/mysql/`
- **PM2 Logs**: `~/.pm2/logs/`

### Support

For technical support and bug reports:
- Create an issue in the project repository
- Contact the development team
- Check the project wiki for additional documentation

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Maintained by**: University Portal Development Team