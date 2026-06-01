const router = require('express').Router();
const controller = require('./appointment.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const { uploadSingle } = require('../../middlewares/upload');
const { listAppointmentQuerySchema } = require('./appointment.validator');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.post('/', authorize(ROLES.PATIENT), controller.create);
router.get('/', authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.SUPPORT_STAFF), validate(listAppointmentQuerySchema, 'query'), controller.getAll);
router.get('/:id', authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.PATIENT, ROLES.SUPPORT_STAFF), controller.getById);
router.patch('/:id/confirm', authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN), controller.confirm);
router.patch('/:id/reschedule', authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.PATIENT), controller.reschedule);
router.patch('/:id/cancel', authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.PATIENT), controller.cancel);
router.patch('/:id/start', authorize(ROLES.DOCTOR), controller.start);
router.patch('/:id/complete', authorize(ROLES.DOCTOR), controller.complete);
router.get('/:id/attachments', controller.getAttachments);
router.post('/:id/attachments', uploadSingle('file'), controller.addAttachment);

module.exports = router;
