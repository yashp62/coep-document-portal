const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
// Rate limiting removed
require('dotenv').config();

const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const universityBodyRoutes = require('./routes/universityBodies');
const initRoutes = require('./routes/init');

// Role-specific routes
const superAdminUserRoutes = require('./routes/superAdminUsers');
const adminUserRoutes = require('./routes/adminUsers');
const subAdminUserRoutes = require('./routes/subAdminUsers');

const superAdminDocumentRoutes = require('./routes/superAdminDocuments');
const adminDocumentRoutes = require('./routes/adminDocuments');
const subAdminDocumentRoutes = require('./routes/subAdminDocuments');

const superAdminUniversityBodyRoutes = require('./routes/superAdminUniversityBodies');
const adminUniversityBodyRoutes = require('./routes/adminUniversityBodies');
const subAdminUniversityBodyRoutes = require('./routes/subAdminUniversityBodies');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Swagger configuration
const { specs, swaggerUi } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - TEMPORARILY DISABLED
// Rate limiting removed

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://coep-frontend.onrender.com',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
    port: PORT
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'University Portal API Documentation'
}));

// API routes
app.use('/api/init', initRoutes);
app.use('/api/auth', authRoutes);

// Legacy routes (for backwards compatibility)
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/university-bodies', universityBodyRoutes);

// Role-specific routes
// Super Admin routes
app.use('/api/super-admin/users', superAdminUserRoutes);
app.use('/api/super-admin/documents', superAdminDocumentRoutes);
app.use('/api/super-admin/university-bodies', superAdminUniversityBodyRoutes);

// Admin routes
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/documents', adminDocumentRoutes);
app.use('/api/admin/university-bodies', adminUniversityBodyRoutes);

// Sub Admin routes
app.use('/api/sub-admin/users', subAdminUserRoutes);
app.use('/api/sub-admin/documents', subAdminDocumentRoutes);
app.use('/api/sub-admin/university-bodies', subAdminUniversityBodyRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Note: Database schema managed through migrations
    // Run 'npm run db:migrate' to apply database changes
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();
