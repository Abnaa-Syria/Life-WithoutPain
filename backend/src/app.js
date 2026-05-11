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

// Module routes
const authRoutes = require('./modules/auth/auth.route');
const patientRoutes = require('./modules/patients/patient.route');
const doctorRoutes = require('./modules/doctors/doctor.route');
const specialityRoutes = require('./modules/specialities/speciality.route');
const serviceRoutes = require('./modules/services/service.route');
const appointmentRoutes = require('./modules/appointments/appointment.route');
const insuranceProviderRoutes = require('./modules/insurance-providers/insuranceProvider.route');
const insuranceCaseRoutes = require('./modules/insurance-cases/insuranceCase.route');
const supportCaseRoutes = require('./modules/support-cases/supportCase.route');
const conversationRoutes = require('./modules/conversations/conversation.route');
const callSessionRoutes = require('./modules/call-sessions/callSession.route');
const labTestRoutes = require('./modules/lab-tests/labTest.route');
const reportRoutes = require('./modules/reports/report.route');
const prescriptionRoutes = require('./modules/prescriptions/prescription.route');
const paymentRoutes = require('./modules/payments/payment.route');
const claimRoutes = require('./modules/claims/claim.route');
const reconciliationRoutes = require('./modules/reconciliations/reconciliation.route');
const doctorPayoutRoutes = require('./modules/doctor-payouts/doctorPayout.route');
const notificationRoutes = require('./modules/notifications/notification.route');
const reviewRoutes = require('./modules/reviews/review.route');
const settingRoutes = require('./modules/settings/setting.route');
const auditLogRoutes = require('./modules/audit-logs/auditLog.route');
const adminRoutes = require('./modules/admin/admin.route');
const dashboardRoutes = require('./modules/dashboard/dashboard.route');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());

// Rate limiting
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

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

app.use(`${api}/auth`, authRoutes);
app.use(`${api}/patients`, patientRoutes);
app.use(`${api}/doctors`, doctorRoutes);
app.use(`${api}/specialities`, specialityRoutes);
app.use(`${api}/services`, serviceRoutes);
app.use(`${api}/appointments`, appointmentRoutes);
app.use(`${api}/insurance-providers`, insuranceProviderRoutes);
app.use(`${api}/insurance-cases`, insuranceCaseRoutes);
app.use(`${api}/support-cases`, supportCaseRoutes);
app.use(`${api}/conversations`, conversationRoutes);
app.use(`${api}/call-sessions`, callSessionRoutes);
app.use(`${api}/lab-tests`, labTestRoutes);
app.use(`${api}/reports`, reportRoutes);
app.use(`${api}/prescriptions`, prescriptionRoutes);
app.use(`${api}/payments`, paymentRoutes);
app.use(`${api}/claims`, claimRoutes);
app.use(`${api}/reconciliations`, reconciliationRoutes);
app.use(`${api}/doctor-payouts`, doctorPayoutRoutes);
app.use(`${api}/notifications`, notificationRoutes);
app.use(`${api}/reviews`, reviewRoutes);
app.use(`${api}/settings`, settingRoutes);
app.use(`${api}/audit-logs`, auditLogRoutes);
app.use(`${api}/admin`, adminRoutes);
app.use(`${api}/dashboard`, dashboardRoutes);

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
