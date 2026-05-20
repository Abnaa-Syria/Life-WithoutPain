/** @deprecated Use /api/v1/patient/* Patient App routes instead */
const router = require('express').Router();
const controller = require('./patient.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { uploadSingle } = require('../../middlewares/upload');
const { validate } = require('../../middlewares/validate');
const {
  updateMedicalProfileSchema,
  attachmentIdParamSchema,
  attachmentUploadBodySchema,
} = require('../medical-profile/medical-profile.validator');
const { medicalProfileAttachmentsUpload } = require('../medical-profile/medical-profile.middleware');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.PATIENT));

router.get('/me/profile', controller.getProfile);
router.put('/me/profile', controller.updateProfile);

router.get('/me/medical-profile', controller.getMedicalProfile);
router.put(
  '/me/medical-profile',
  validate(updateMedicalProfileSchema),
  controller.updateMedicalProfile,
);

router.get('/me/medical-profile/attachments', controller.listMedicalProfileAttachments);
router.post(
  '/me/medical-profile/attachments',
  medicalProfileAttachmentsUpload,
  validate(attachmentUploadBodySchema),
  controller.addMedicalProfileAttachments,
);
router.delete(
  '/me/medical-profile/attachments/:id',
  validate(attachmentIdParamSchema, 'params'),
  controller.deleteMedicalProfileAttachment,
);

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
