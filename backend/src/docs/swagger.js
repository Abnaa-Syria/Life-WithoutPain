const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Haya Bila Alam - حياة بلا ألم API',
      version: '1.0.0',
      description: 'Healthcare & Telemedicine Platform API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@hayabilaalam.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errorCode: { type: 'string', example: 'ERROR_CODE' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
        PaginationQuery: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 20 },
            sortBy: { type: 'string' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
            search: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & Authorization' },
      { name: 'Patients', description: 'Patient endpoints' },
      { name: 'Doctors', description: 'Doctor endpoints' },
      { name: 'Specialities', description: 'Specialities management' },
      { name: 'Services', description: 'Services management' },
      { name: 'Appointments', description: 'Appointment management' },
      { name: 'Insurance Providers', description: 'Insurance provider management' },
      { name: 'Insurance Cases', description: 'Insurance case workflow' },
      { name: 'Support Cases', description: 'Customer support workflow' },
      { name: 'Conversations', description: 'Chat & messaging' },
      { name: 'Call Sessions', description: 'Video/Voice calls' },
      { name: 'Lab Tests', description: 'Lab test requests & results' },
      { name: 'Reports', description: 'Medical reports' },
      { name: 'Prescriptions', description: 'Electronic prescriptions' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Claims', description: 'Insurance claims & batches' },
      { name: 'Reconciliations', description: 'Payment reconciliation' },
      { name: 'Doctor Payouts', description: 'Doctor commission & payouts' },
      { name: 'Notifications', description: 'Notification management' },
      { name: 'Reviews', description: 'Patient reviews & ratings' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Settings', description: 'System settings' },
      { name: 'Audit Logs', description: 'Audit trail' },
    ],
  },
  apis: [
    './src/docs/swagger/*.js',
    './src/modules/**/route*.js',
    './src/modules/**/*.route.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
