const router = require('express').Router();
const controller = require('./patient.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { uploadSingle } = require('../../middlewares/upload');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.PATIENT));

/**
 * @swagger
 * /patients/me/profile:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Patient profile }
 *   put:
 *     tags: [Patients]
 *     summary: Update patient profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile updated }
 */
router.get('/me/profile', controller.getProfile);
router.put('/me/profile', controller.updateProfile);

router.get('/me/medical-profile', controller.getMedicalProfile);
router.put('/me/medical-profile', controller.updateMedicalProfile);

router.get('/me/family-members', controller.getFamilyMembers);
router.post('/me/family-members', controller.createFamilyMember);
router.put('/me/family-members/:id', controller.updateFamilyMember);
router.delete('/me/family-members/:id', controller.deleteFamilyMember);

router.get('/me/insurances', controller.getInsurances);
router.post('/me/insurances', controller.createInsurance);
router.put('/me/insurances/:id', controller.updateInsurance);
router.delete('/me/insurances/:id', controller.deleteInsurance);

router.get('/me/files', controller.getMedicalFiles);
router.post('/me/files', uploadSingle('file'), controller.uploadMedicalFile);

router.get('/me/dashboard-summary', controller.getDashboardSummary);
router.get('/me/appointments/upcoming', controller.getUpcomingAppointments);
router.get('/me/appointments/history', controller.getAppointmentHistory);
router.get('/me/notifications', controller.getNotifications);
router.patch('/me/settings', controller.updateSettings);

module.exports = router;
