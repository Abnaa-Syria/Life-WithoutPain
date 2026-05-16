const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

// Public routes
router.use('/auth', require('../auth/auth.doctor.routes'));
router.use('/specializations', require('../specialities/speciality.doctor.routes'));

// Protected doctor routes
router.use(authenticate, authorize(ROLES.DOCTOR));
router.use('/availabilities', require('../doctors/availability.doctor.routes'));
router.use('/appointments', require('../appointments/appointment.doctor.routes'));
router.use('/patients', require('../patients/patient.doctor.routes'));
router.use('/prescriptions', require('../prescriptions/prescription.doctor.routes'));
router.use('/reports', require('../reports/report.doctor.routes'));
router.use('/notifications', require('../notifications/notification.doctor.routes'));
router.use('/profile', require('../doctors/doctorProfile.doctor.routes'));
router.use('/clinic-details', require('../doctors/clinic.doctor.routes'));
router.use('/settings', require('../doctors/settings.doctor.routes'));

module.exports = router;
