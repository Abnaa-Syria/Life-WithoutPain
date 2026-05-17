const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const swaggerSpec = require('./docs/swagger');
const { backendCoreSpec, doctorAppSwaggerSpec, patientAppSwaggerSpec, filterSpecByModule, getAvailableModules } = swaggerSpec;
const errorHandler = require('./middlewares/errorHandler');
const { globalLimiter } = require('./middlewares/rateLimiter');
const logger = require('./config/logger');

const loadRoutes = require('./utils/routeLoader');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: config.env === 'development' ? '*' : config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

app.use(compression());

// Rate limiting
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
const uploadsDir = path.resolve(__dirname, '..', config.upload.dir);
app.use('/uploads', express.static(uploadsDir));

// Request logging
app.use((req, res, next) => {
  logger.info({ msg: `${req.method} ${req.originalUrl}`, ip: req.ip });
  next();
});

// Swagger docs customization and setup
const customCss = `
  .swagger-ui .topbar {
    background-color: #0f172a !important;
    padding: 12px 0;
    border-bottom: 1px solid #1e293b;
  }
  .swagger-ui .topbar .topbar-wrapper {
    max-width: 1460px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex !important;
    align-items: center;
    justify-content: space-between;
  }
  .swagger-ui .topbar .topbar-wrapper a, 
  .swagger-ui .topbar .topbar-wrapper form {
    display: none !important;
  }
  .swagger-ui .topbar .topbar-wrapper::before {
    content: "Haya Bila Alam - API Portal";
    color: #f8fafc;
    font-family: 'Outfit', 'Inter', sans-serif;
    font-weight: 700;
    font-size: 1.25rem;
    letter-spacing: -0.025em;
    background: linear-gradient(to right, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .swagger-ui .topbar .topbar-wrapper .download-url-wrapper {
    display: flex !important;
    align-items: center;
  }
  .swagger-ui .topbar .topbar-wrapper select {
    background-color: #1e293b !important;
    color: #f8fafc !important;
    border: 1px solid #334155 !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    outline: none !important;
    transition: all 0.2s ease !important;
    cursor: pointer !important;
  }
  .swagger-ui .topbar .topbar-wrapper select:hover {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
  }
`;

const availableModules = getAvailableModules();
const swaggerUrls = [
  { url: '/api-docs/backend.json', name: 'Core Backend API' },
  { url: '/api-docs/patient.json', name: 'Patient App' },
  { url: '/api-docs/doctor.json', name: 'Doctor Mobile App' },
  ...availableModules.map(mod => ({
    url: `/api-docs/modules/${mod}.json`,
    name: `${mod.charAt(0).toUpperCase() + mod.slice(1).replace(/-([a-z])/g, (g) => ' ' + g[1].toUpperCase())} Module`
  }))
];

// 1. JSON endpoints
app.get('/api-docs/backend.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(backendCoreSpec);
});

app.get('/api-docs/doctor.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(doctorAppSwaggerSpec);
});

app.get('/api-docs/patient.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(patientAppSwaggerSpec);
});

app.get('/api-docs/modules/:moduleName.json', (req, res) => {
  const spec = filterSpecByModule(swaggerSpec, req.params.moduleName);
  if (!spec || Object.keys(spec.paths).length === 0) {
    return res.status(404).json({ success: false, message: `Module "${req.params.moduleName}" not found or empty` });
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(spec);
});

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 2. Redirect endpoints for clean URLs
app.get('/api-docs/doctor', (req, res) => {
  res.redirect('/api-docs?module=doctor');
});

app.get('/api-docs/patient', (req, res) => {
  res.redirect('/api-docs?module=patient');
});

app.get('/api-docs/modules/:moduleName', (req, res) => {
  res.redirect(`/api-docs?module=${req.params.moduleName}`);
});

// 3. Main Swagger UI endpoint with dynamic module pre-selection via query param
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  const selectedModule = req.query.module;
  let reorderedUrls = swaggerUrls;

  if (selectedModule) {
    const matchedUrlObj = swaggerUrls.find(u => 
      u.url.endsWith(`/${selectedModule}.json`) || 
      u.url.endsWith(`/modules/${selectedModule}.json`)
    );
    if (matchedUrlObj) {
      reorderedUrls = [
        { ...matchedUrlObj, name: matchedUrlObj.name + ' (Selected)' },
        ...swaggerUrls.filter(u => u !== matchedUrlObj)
      ];
    }
  }

  swaggerUi.setup(null, {
    customCss: customCss,
    customSiteTitle: 'Haya Bila Alam - API Portal',
    swaggerOptions: {
      urls: reorderedUrls,
      docExpansion: 'none',
      persistAuthorization: true,
    },
  })(req, res, next);
});

// API routes
const api = config.apiPrefix;

// Automatically load all routes from modules
loadRoutes(app, api);

// Custom routes that don't follow the pattern can be added here manually if needed
// adminRoutes is still used temporarily until its routes are fully migrated
const adminRoutes = require('./modules/admin/admin.route');
app.use(`${api}/admin`, adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Haya Bila Alam API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', errorCode: 'ROUTE_NOT_FOUND' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
