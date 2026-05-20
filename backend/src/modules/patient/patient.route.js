const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use('/auth', require('../auth/auth.patient.routes'));

router.use(authenticate, authorize(ROLES.PATIENT));

router.use('/profile', require('./profile.patient.routes'));
router.use('/medical-profile', require('./medical-profile.patient.routes'));
router.use('/family-members', require('./family-members.patient.routes'));
router.use('/insurances', require('./insurances.patient.routes'));
router.use('/files', require('./files.patient.routes'));
router.use('/appointments', require('./appointments.patient.routes'));
router.use('/home-services', require('./home-services.patient.routes'));
router.use('/doctors', require('./doctors.patient.routes'));
router.use('/specializations', require('./specializations.patient.routes'));
router.use('/services', require('./services.patient.routes'));
router.use('/directories', require('./directories.patient.routes'));
router.use('/conversations', require('./conversations.patient.routes'));
router.use('/call-sessions', require('./call-sessions.patient.routes'));
router.use('/payments', require('./payments.patient.routes'));
router.use('/support', require('./support.patient.routes'));
router.use('/settings', require('./settings.patient.routes'));
router.use('/notifications', require('./notifications.patient.routes'));

module.exports = router;
