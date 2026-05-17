const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Haya Bila Alam - حياة بلا ألم API',
      version: '1.0.0',
      description: 'Complete API reference for all platform modules. Endpoints are grouped by module tags (Auth, Patients, Doctors, Doctor App, Admin, etc.). Auto-discovered routes are merged with hand-written schemas.',
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
      { name: 'Dashboard', description: 'Admin dashboard statistics' },
      { name: 'Admin', description: 'Admin panel CRUD and operations' },
      { name: 'Auth', description: 'Authentication & Authorization' },
      { name: 'Patients', description: 'Patient app endpoints' },
      { name: 'Doctors', description: 'Doctor discovery & profile' },
      { name: 'Doctor App', description: 'Mobile doctor application API' },
      { name: 'Appointments', description: 'Appointment management' },
      { name: 'Prescriptions', description: 'Electronic prescriptions' },
      { name: 'Reports', description: 'Medical reports' },
      { name: 'Lab Tests', description: 'Lab test requests & results' },
      { name: 'Conversations', description: 'Chat & messaging' },
      { name: 'Call Sessions', description: 'Video/Voice calls' },
      { name: 'Notifications', description: 'Notification management' },
      { name: 'Reviews', description: 'Patient reviews & ratings' },
      { name: 'Specialities', description: 'Medical specialities' },
      { name: 'Services', description: 'Healthcare services catalog' },
      { name: 'Insurance Providers', description: 'Insurance provider management' },
      { name: 'Insurance Cases', description: 'Insurance case workflow' },
      { name: 'Support Cases', description: 'Customer support workflow' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Claims', description: 'Insurance claims & batches' },
      { name: 'Reconciliations', description: 'Payment reconciliation' },
      { name: 'Doctor Payouts', description: 'Doctor commission & payouts' },
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

const manualSwaggerSpec = swaggerJsdoc(options);
const { buildPathsFromRoutes, mergeSpecs } = require('./swagger/routeRegistry');
const autoRoutes = buildPathsFromRoutes();
const swaggerSpec = mergeSpecs(manualSwaggerSpec, autoRoutes);

function filterSpecByTag(spec, tag) {
  const paths = {};
  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    const filtered = {};
    Object.entries(methods).forEach(([method, operation]) => {
      if (operation?.tags?.includes(tag)) {
        filtered[method] = operation;
      }
    });
    if (Object.keys(filtered).length > 0) {
      paths[path] = filtered;
    }
  });
  return {
    ...spec,
    paths,
    tags: (spec.tags || []).filter((t) => t.name === tag),
  };
}

const doctorAppSwaggerSpec = filterSpecByTag(swaggerSpec, 'Doctor App');

module.exports = swaggerSpec;
module.exports.doctorAppSwaggerSpec = doctorAppSwaggerSpec;
module.exports.filterSpecByTag = filterSpecByTag;