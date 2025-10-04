const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'University Portal API',
      version: '1.0.0',
      description: 'A comprehensive API for University Curriculum & Document Portal with role-based access control',
      contact: {
        name: 'University Portal Team',
        email: 'admin@university.edu'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server'
      },
      {
        url: 'https://your-production-domain.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'role'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the user'
            },
            first_name: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            last_name: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@university.edu'
            },
            role: {
              type: 'string',
              enum: ['super_admin', 'admin', 'sub_admin'],
              description: 'User role in the system'
            },
            is_active: {
              type: 'boolean',
              description: 'Whether the user account is active'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        Document: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the document'
            },
            title: {
              type: 'string',
              description: 'Document title',
              example: 'Academic Policies 2024'
            },
            description: {
              type: 'string',
              description: 'Document description',
              example: 'Updated academic policies for the academic year 2024-25'
            },
            file_name: {
              type: 'string',
              description: 'Original filename of the uploaded document'
            },
            mime_type: {
              type: 'string',
              description: 'MIME type of the document',
              example: 'application/pdf'
            },
            file_size: {
              type: 'integer',
              description: 'File size in bytes'
            },
            uploaded_by_id: {
              type: 'integer',
              description: 'ID of the user who uploaded the document'
            },
            university_body_id: {
              type: 'integer',
              nullable: true,
              description: 'ID of the associated university body'
            },
            is_public: {
              type: 'boolean',
              description: 'Whether the document is publicly accessible'
            },
            approval_status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'Document approval status'
            },
            approved_by_id: {
              type: 'integer',
              nullable: true,
              description: 'ID of the user who approved the document'
            },
            approved_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Timestamp when document was approved'
            },
            requested_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Timestamp when approval was requested'
            },
            rejection_reason: {
              type: 'string',
              nullable: true,
              description: 'Reason for document rejection'
            },
            download_count: {
              type: 'integer',
              description: 'Number of times document has been downloaded'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Document creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Document last update timestamp'
            }
          }
        },
        UniversityBody: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the university body'
            },
            name: {
              type: 'string',
              description: 'Name of the university body',
              example: 'Academic Council'
            },
            type: {
              type: 'string',
              enum: ['Committee', 'Board'],
              description: 'Type of university body'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Description of the university body'
            },
            admin_id: {
              type: 'integer',
              nullable: true,
              description: 'ID of the admin managing this body'
            },
            is_active: {
              type: 'boolean',
              description: 'Whether the university body is active'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'admin@university.edu'
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'securePassword123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT authentication token'
                },
                user: {
                  $ref: '#/components/schemas/User'
                }
              }
            },
            message: {
              type: 'string',
              example: 'Login successful'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Current page number'
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages'
            },
            totalDocuments: {
              type: 'integer',
              description: 'Total number of documents'
            },
            totalUsers: {
              type: 'integer',
              description: 'Total number of users'
            },
            totalBodies: {
              type: 'integer',
              description: 'Total number of university bodies'
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page'
            },
            hasPrevPage: {
              type: 'boolean',
              description: 'Whether there is a previous page'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that caused the error'
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Public',
        description: 'Public endpoints accessible without authentication'
      },
      {
        name: 'Super Admin',
        description: 'Endpoints accessible only to super administrators'
      },
      {
        name: 'Admin',
        description: 'Endpoints accessible to administrators'
      },
      {
        name: 'Sub Admin',
        description: 'Endpoints accessible to sub administrators'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};