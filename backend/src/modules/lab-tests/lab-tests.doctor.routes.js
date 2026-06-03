const router = require('express').Router();
const controller = require('./labTest.doctor.controller');
const { uploadSingle } = require('../../middlewares/upload');

// All routes here are pre-authenticated and authorized as DOCTOR by doctor.route.js

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/results', uploadSingle('file'), controller.uploadResult);
router.get('/:id/results', controller.getResults);

module.exports = router;
