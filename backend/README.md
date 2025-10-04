# University Portal Backend

Backend API for the University Curriculum & Document Portal built with Node.js, Express.js, MySQL, and Sequelize.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Three user roles (General, Admin, Super Admin)
- **Document Management**: Upload, download, and manage documents
- **Category Management**: Organize documents by categories
- **User Management**: Super Admin can manage all user accounts
- **File Upload**: Secure file upload with validation
- **Search & Filter**: Advanced document search and filtering
- **Security**: Helmet, CORS, rate limiting, input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator, Joi

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify-token` - Verify JWT token

### Users (Super Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/toggle-status` - Toggle user status

### Documents
- `GET /api/documents` - Get all documents (with search/filter)
- `GET /api/documents/:id` - Get document by ID
- `GET /api/documents/:id/download` - Download document
- `POST /api/documents` - Upload document (Admin only)
- `PUT /api/documents/:id` - Update document (Admin only)
- `DELETE /api/documents/:id` - Delete document (Admin only)
- `GET /api/documents/my-documents` - Get my documents (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)
- `PUT /api/categories/:id/toggle-status` - Toggle category status

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp env.example .env
   ```

3. Configure your `.env` file with your database credentials and other settings.

4. Set up MySQL database:
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE dashboard;
   ```

5. Run migrations:
   ```bash
   npm run db:migrate
   ```

6. Seed initial data:
   ```bash
   npm run db:seed
   ```

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dashboard
DB_USER=root
DB_PASSWORD=your_mysql_password

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

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Database Commands

```bash
# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Run seeders
npm run db:seed

# Undo all seeders
npm run db:seed:undo
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Linting

Check code style:
```bash
npm run lint
```

Fix code style issues:
```bash
npm run lint:fix
```

## Default Super Admin

After running the seeders, you can login with:
- **Email**: admin@university.edu
- **Password**: Admin123!

**Important**: Change the default password immediately after first login!

## Security Features

- JWT token authentication
- bcrypt password hashing
- Role-based access control
- File upload validation
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)

## File Upload

Supported file types:
- PDF documents
- Microsoft Word documents (.doc, .docx)
- Plain text files
- JPEG and PNG images

Maximum file size: 10MB (configurable)

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Run linting before committing
