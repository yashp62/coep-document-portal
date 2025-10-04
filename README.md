# University Portal - Secure Document System

## 🚀 Project Overview

The University Portal is a comprehensive web application designed for managing university documents, university bodies (boards and committees), and user roles within an academic institution. The system implements a robust role-based access control system with three distinct user roles: Super Admin, Admin, and Sub Admin.

## ✨ Key Features

### 🔐 Role-Based Access Control
- **Super Admin**: Full system access and control
- **Admin**: Limited administrative access with document management
- **Sub Admin**: Basic user access with personal document management

### 📄 Document Management
- Secure file upload with validation
- Document approval workflow
- Public document access for approved items
- Download tracking and analytics
- 24-hour deletion rule for non-super admins

### 🏛️ University Bodies Management
- Board and Committee management
- Admin assignment capabilities
- Role-based access to university bodies

### 🛡️ Security Features
- JWT-based authentication
- Password hashing with bcrypt
- File type and size validation
- SQL injection prevention
- XSS protection
- CORS configuration

## 🛠️ Technology Stack

### Backend
- **Node.js** v20+ - JavaScript runtime
- **Express.js** v4.18+ - Web application framework
- **MySQL** v8.0+ - Database
- **Sequelize** v6.35+ - ORM
- **JWT** - Authentication
- **Swagger** - API documentation
- **Multer** - File upload handling

### Frontend
- **React** v18+ - UI framework
- **Redux Toolkit** - State management
- **Tailwind CSS** v3+ - Styling
- **Vite** v5+ - Build tool
- **React Router** v6+ - Routing
- **Axios** - HTTP client

## 📁 Project Structure

```
university-portal/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── middleware/     # Authentication, validation, error handling
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes (role-specific)
│   │   ├── migrations/     # Database migrations
│   │   ├── seeders/        # Database seeders
│   │   └── utils/          # Utility functions
│   ├── uploads/            # File storage directory
│   └── swagger.js          # API documentation configuration
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service functions
│   │   ├── store/          # Redux store and slices
│   │   └── utils/          # Utility functions
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js v20+ installed
- MySQL v8.0+ installed and running
- Git installed

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
# Edit .env with your database credentials
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE dashboard;
exit

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
# Edit .env with your API URL
```

### 5. Start Development Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 📖 API Documentation

### Interactive Documentation
Access the comprehensive API documentation with Swagger UI:
- **Development**: http://localhost:5001/api-docs
- **Production**: https://your-domain.com/api-docs

### Role-Based Endpoints

#### Super Admin Routes
- `GET /api/super-admin/users` - Get all users
- `POST /api/super-admin/users` - Create user
- `PUT /api/super-admin/users/:id` - Update user
- `DELETE /api/super-admin/users/:id` - Delete user
- `GET /api/super-admin/documents` - Get all documents
- `POST /api/super-admin/documents` - Upload document (auto-approved)
- `PUT /api/super-admin/documents/:id/approve` - Approve document
- `PUT /api/super-admin/documents/:id/reject` - Reject document

#### Admin Routes
- `GET /api/admin/users` - Get admin/sub-admin users
- `POST /api/admin/users` - Create sub-admin
- `GET /api/admin/documents` - Get own + public documents
- `POST /api/admin/documents` - Upload document (pending)
- `PUT /api/admin/documents/:id` - Update own document (24h rule)

#### Sub Admin Routes
- `GET /api/sub-admin/users/profile` - Get own profile
- `PUT /api/sub-admin/users/profile` - Update own profile
- `GET /api/sub-admin/documents` - Get own + public documents
- `POST /api/sub-admin/documents` - Upload document (pending)

#### Public Routes
- `GET /api/documents` - Get public approved documents
- `GET /api/documents/:id/download` - Download public document

## 🔧 Environment Configuration

### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5001
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dashboard
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=University Portal
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and roles
- **university_bodies** - Boards and committees
- **documents** - Document metadata and relationships

### Key Relationships
- Users → Documents (one-to-many)
- Users → University Bodies (one-to-many, admin assignment)
- University Bodies → Documents (one-to-many)

## 🛡️ Security & Permissions

### Role Permissions Matrix

| Feature | Super Admin | Admin | Sub Admin | Public |
|---------|-------------|-------|-----------|--------|
| User Management | Full CRUD | Create Sub-Admin | Own Profile | None |
| Document Approval | Yes | No | No | No |
| Document Upload | Auto-Approved | Pending | Pending | No |
| Document Delete | Anytime | 24h Rule | 24h Rule | No |
| University Bodies | Full CRUD | Limited Update | Read Only | Read Only |

### 24-Hour Rule
- Admins and Sub-admins can only delete their documents within 24 hours
- After 24 hours, only Super Admin can delete documents
- Ensures document integrity and audit trail

## 🚀 Deployment

### Production Deployment

#### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up -d
```

#### Manual Deployment
```bash
# Install PM2 for process management
npm install -g pm2

# Build frontend
cd frontend && npm run build

# Start backend with PM2
cd backend && pm2 start src/server.js --name university-portal

# Configure Nginx reverse proxy
sudo cp nginx.conf /etc/nginx/sites-available/university-portal
sudo ln -s /etc/nginx/sites-available/university-portal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:coverage      # Run with coverage
npm run test:watch         # Watch mode
```

### Frontend Testing
```bash
cd frontend
npm test                    # Run all tests
npm run test:coverage      # Run with coverage
```

### API Testing
```bash
# Health check
curl http://localhost:5001/health

# Authentication test
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"password"}'
```

## 📝 Development Workflow

### Database Migrations
```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:migrate:undo
```

### Adding New Features
1. Create/update database models
2. Write migrations
3. Create/update API routes with Swagger documentation
4. Update frontend services and components
5. Add tests
6. Update documentation

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1"
```

#### File Upload Issues
```bash
# Check upload directory
ls -la backend/uploads/
chmod 755 backend/uploads/
```

#### JWT Issues
```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Clear browser storage if needed
```

## 📚 Additional Resources

- [Technical Documentation](TECHNICAL_DOCUMENTATION.md) - Detailed technical specs
- [Installation Guide](INSTALLATION.md) - Step-by-step installation
- [API Documentation](http://localhost:5001/api-docs) - Interactive Swagger UI
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team** - University Portal Development Team
- **Maintainer** - [Your Name]
- **Contributors** - See [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Node.js**: v20+  
**Status**: Active Development