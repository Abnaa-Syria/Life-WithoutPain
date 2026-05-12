const router = require('express').Router();
const PrescriptionController = require('./prescription.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.post('/', authorize(ROLES.DOCTOR), PrescriptionController.create);
router.get('/', PrescriptionController.list);
router.get('/:id', PrescriptionController.getById);
router.put('/:id', authorize(ROLES.DOCTOR), PrescriptionController.update);
router.get('/:id/pdf', PrescriptionController.getPdf);
router.get('/:id/qr', PrescriptionController.getQr);

module.exports = router;
