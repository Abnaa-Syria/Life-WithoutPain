const router = require('express').Router();
const controller = require('./doctor.controller');
const { authenticate, authorize, optionalAuth } = require('../../middlewares/auth');
const { uploadSingle } = require('../../middlewares/upload');
const { ROLES } = require('../../constants');

// Protected doctor routes (must be before /:id)
router.get('/me/profile', authenticate, authorize(ROLES.DOCTOR), controller.getProfile);
router.put('/me/profile', authenticate, authorize(ROLES.DOCTOR), controller.updateProfile);
router.post('/me/verification-documents', authenticate, authorize(ROLES.DOCTOR), uploadSingle('file'), controller.uploadVerificationDocument);
router.get('/me/verification-status', authenticate, authorize(ROLES.DOCTOR), controller.getVerificationStatus);
router.get('/me/availability', authenticate, authorize(ROLES.DOCTOR), controller.getAvailability);
router.post('/me/availability', authenticate, authorize(ROLES.DOCTOR), controller.createAvailability);
router.put('/me/availability/:id', authenticate, authorize(ROLES.DOCTOR), controller.updateAvailability);
router.delete('/me/availability/:id', authenticate, authorize(ROLES.DOCTOR), controller.deleteAvailability);
router.get('/me/dashboard-summary', authenticate, authorize(ROLES.DOCTOR), controller.getDashboardSummary);
router.get('/me/appointments', authenticate, authorize(ROLES.DOCTOR), controller.getAppointments);
router.get('/me/patients', authenticate, authorize(ROLES.DOCTOR), controller.getPatients);
router.get('/me/performance', authenticate, authorize(ROLES.DOCTOR), controller.getPerformance);
router.get('/me/financial-summary', authenticate, authorize(ROLES.DOCTOR), controller.getFinancialSummary);

// Public discovery routes
router.get('/search', optionalAuth, controller.search);
router.get('/:id', optionalAuth, controller.getById);

module.exports = router;
