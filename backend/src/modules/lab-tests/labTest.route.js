const router = require('express').Router();
const LabTestController = require('./labTest.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { uploadSingle } = require('../../middlewares/upload');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.post('/', authorize(ROLES.DOCTOR), LabTestController.create);
router.get('/', LabTestController.list);
router.get('/:id', LabTestController.getById);
router.patch('/:id/status', LabTestController.updateStatus);
router.post('/:id/results', uploadSingle('file'), LabTestController.uploadResult);
router.get('/:id/results', LabTestController.getResults);

module.exports = router;
