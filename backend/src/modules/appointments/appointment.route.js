const router = require('express').Router();
const controller = require('./appointment.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { uploadSingle } = require('../../middlewares/upload');
const { ROLES } = require('../../constants');

router.use(authenticate);

/**
 * @swagger
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create appointment
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Appointment created }
 *   get:
 *     tags: [Appointments]
 *     summary: List appointments
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Appointment list }
 */
router.post('/', authorize(ROLES.PATIENT), controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.patch('/:id/confirm', authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN), controller.confirm);
router.patch('/:id/reschedule', controller.reschedule);
router.patch('/:id/cancel', controller.cancel);
router.patch('/:id/start', authorize(ROLES.DOCTOR), controller.start);
router.patch('/:id/complete', authorize(ROLES.DOCTOR), controller.complete);
router.get('/:id/attachments', controller.getAttachments);
router.post('/:id/attachments', uploadSingle('file'), controller.addAttachment);

module.exports = router;
