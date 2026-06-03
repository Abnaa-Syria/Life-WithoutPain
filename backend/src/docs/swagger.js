const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config');
const {
  DOCTOR_APP_PREFIX,
  PATIENT_APP_PREFIX,
  buildAppTags,
  DOCTOR_APP_SUBMODULES,
  PATIENT_APP_SUBMODULES,
  allDoctorAppTagNames,
  allPatientAppTagNames,
} = require('./swagger/app-doc-tags');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Haya Bila Alam - حياة بلا ألم API',
      version: '1.0.0',
      description:
        'Complete API reference for all platform modules. Doctor and Patient mobile APIs are grouped by sub-module tags (e.g. Doctor App - Appointments, Patient App - Auth). ' +
        'Send the `Accept-Language` header (`ar` or `en`) on every request for localized messages and catalog text; it is documented on all operations.',
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
      parameters: {
        AcceptLanguage: {
          in: 'header',
          name: 'Accept-Language',
          required: false,
          description:
            'Response locale for messages and localized catalog fields (ar | en). Used for this request when sent; DB preferredLanguage applies only if the header is omitted.',
          schema: { type: 'string', enum: ['ar', 'en'], default: 'ar' },
          example: 'ar',
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
      { name: 'Patients', description: 'Legacy patient profile endpoints' },
      ...buildAppTags(PATIENT_APP_PREFIX, PATIENT_APP_SUBMODULES),
      { name: 'Doctors', description: 'Doctor discovery & profile' },
      ...buildAppTags(DOCTOR_APP_PREFIX, DOCTOR_APP_SUBMODULES),
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
    './src/docs/swagger/**/*.swagger.js',
    './src/modules/**/route*.js',
    './src/modules/**/*.route.js',
  ],
};

const { injectAcceptLanguageParameter } = require('./swagger/i18n.openapi');
const manualSwaggerSpec = swaggerJsdoc(options);
const { buildPathsFromRoutes, mergeSpecs, TAG_BY_MODULE } = require('./swagger/routeRegistry');
const autoRoutes = buildPathsFromRoutes();
const swaggerSpec = injectAcceptLanguageParameter(mergeSpecs(manualSwaggerSpec, autoRoutes));

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

/** Include all operations tagged under an app prefix (e.g. "Doctor App - Auth") */
function filterSpecByApp(spec, appPrefix) {
  const paths = {};
  Object.entries(spec.paths || {}).forEach(([pathKey, methods]) => {
    const filtered = {};
    Object.entries(methods).forEach(([method, operation]) => {
      const matches = operation?.tags?.some(
        (t) => t === appPrefix || t.startsWith(`${appPrefix} - `),
      );
      if (matches) filtered[method] = operation;
    });
    if (Object.keys(filtered).length > 0) paths[pathKey] = filtered;
  });

  return {
    ...spec,
    paths,
    tags: (spec.tags || []).filter(
      (t) => t.name === appPrefix || t.name.startsWith(`${appPrefix} - `),
    ),
  };
}

function filterSpecByAppSubmodule(spec, appPrefix, submoduleKey) {
  const tag = `${appPrefix} - ${submoduleKey.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
  const submodules = appPrefix === DOCTOR_APP_PREFIX ? DOCTOR_APP_SUBMODULES : PATIENT_APP_SUBMODULES;
  const found = submodules.find((m) => m.key === submoduleKey);
  const exactTag = found ? `${appPrefix} - ${found.name}` : tag;
  return filterSpecByTag(spec, exactTag);
}

function filterSpecByModule(spec, moduleName) {
  const mainTag = TAG_BY_MODULE[moduleName] || (moduleName.charAt(0).toUpperCase() + moduleName.slice(1));
  const adminTag = `Admin - ${mainTag}`;
  
  const paths = {};
  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    const filtered = {};
    Object.entries(methods).forEach(([method, operation]) => {
      if (operation?.tags?.includes(mainTag) || operation?.tags?.includes(adminTag)) {
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
    tags: (spec.tags || []).filter((t) => t.name === mainTag || t.name === adminTag),
  };
}

function getBackendCoreSpec(spec) {
  const excludedPrefixes = [DOCTOR_APP_PREFIX, PATIENT_APP_PREFIX];
  const paths = {};
  
  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    const filtered = {};
    Object.entries(methods).forEach(([method, operation]) => {
      const isExcluded = operation?.tags?.some(
        (tag) => excludedPrefixes.some((p) => tag === p || tag.startsWith(`${p} - `)),
      );
      if (!isExcluded) {
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
    tags: (spec.tags || []).filter(
      (t) => !excludedPrefixes.some((p) => t.name === p || t.name.startsWith(`${p} - `)),
    ),
  };
}

function getAvailableModules() {
  return Object.keys(TAG_BY_MODULE).filter(moduleName => {
    const spec = filterSpecByModule(swaggerSpec, moduleName);
    return spec && Object.keys(spec.paths).length > 0;
  });
}

const doctorAppSwaggerSpec = filterSpecByApp(swaggerSpec, DOCTOR_APP_PREFIX);
const patientAppSwaggerSpec = filterSpecByApp(swaggerSpec, PATIENT_APP_PREFIX);
const backendCoreSpec = getBackendCoreSpec(swaggerSpec);

module.exports = swaggerSpec;
module.exports.backendCoreSpec = backendCoreSpec;
module.exports.doctorAppSwaggerSpec = doctorAppSwaggerSpec;
module.exports.patientAppSwaggerSpec = patientAppSwaggerSpec;
module.exports.filterSpecByTag = filterSpecByTag;
module.exports.filterSpecByApp = filterSpecByApp;
module.exports.filterSpecByAppSubmodule = filterSpecByAppSubmodule;
module.exports.filterSpecByModule = filterSpecByModule;
module.exports.getAvailableModules = getAvailableModules;
module.exports.allDoctorAppTagNames = allDoctorAppTagNames;
module.exports.allPatientAppTagNames = allPatientAppTagNames;
module.exports.injectAcceptLanguageParameter = injectAcceptLanguageParameter;