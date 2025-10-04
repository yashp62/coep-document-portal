# COEP Technological University - Official Documents Portal

A full-stack MERN application with MySQL database, local authentication, role-based access control, and secure document management for COEP Technological University's official documents, minutes of meetings, and circulars.

## Features

- **Local Authentication**: Secure user authentication with email/password and JWT tokens
- **Role-Based Access Control (RBAC)**: Three user tiers with different permissions:
  - Public Access: Document search, filtering, and download (no registration required)
  - Board/Committee Directors: Document upload, management, and all public features
  - Super Admin: User account management, board/committee management, and all director features
- **Organizational Structure**: Support for Boards and Committees with directors
- **Document Management**: Secure upload, storage, and retrieval of official documents
- **Public Access**: No registration required for viewing and downloading documents
- **Advanced Search**: Document search with filtering by board, committee, category, and type
- **Director Dashboard**: Interface for board and committee directors to manage documents
- **Super Admin Dashboard**: Interface for managing users, boards, and committees

## Tech Stack

- **Frontend**: React.js with Vite, Redux Toolkit, and modern UI components
- **Backend**: Node.js with Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: MySQL BLOB storage for secure document storage
- **Security**: Helmet, CORS, rate limiting, input validation

## Project Structure

```
sds/
├── backend/          # Node.js/Express backend
├── frontend/         # React frontend
├── docs/            # Documentation
└── README.md        # This file
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Configure environment variables (see .env.example files)
5. Start the development servers:
   ```bash
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory)
   npm start
   ```

## Environment Configuration

See individual README files in backend/ and frontend/ directories for detailed configuration instructions.

## Security Features

- JWT-based authentication with secure token management
- bcrypt password hashing with salt
- Role-based middleware for API protection
- File upload validation and sanitization
- Rate limiting and CORS protection
- Input validation and sanitization
- Helmet.js for secure HTTP headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
