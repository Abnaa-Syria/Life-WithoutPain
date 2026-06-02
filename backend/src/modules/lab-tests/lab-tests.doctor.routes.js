const router = require('express').Router();
const LabTestController = require('./labTest.controller');
const { uploadSingle } = require('../../middlewares/upload');

// All routes here are pre-authenticated and authorized as DOCTOR by doctor.route.js

router.post('/', LabTestController.create);
router.get('/', LabTestController.list);
router.get('/:id', LabTestController.getById);
router.patch('/:id/status', LabTestController.updateStatus);
router.post('/:id/results', uploadSingle('file'), LabTestController.uploadResult);
router.get('/:id/results', LabTestController.getResults);

module.exports = router;
