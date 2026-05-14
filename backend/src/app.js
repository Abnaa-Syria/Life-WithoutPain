const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const swaggerSpec = require('./docs/swagger');
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

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Haya Bila Alam API Docs',
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
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
