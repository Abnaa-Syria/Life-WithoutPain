const router = require('express').Router();
const LabTestController = require('./labTest.controller');

// All routes here are pre-authenticated and authorized as PATIENT by patient.route.js

router.get('/', LabTestController.list);
router.get('/:id', LabTestController.getById);
router.get('/:id/results', LabTestController.getResults);

module.exports = router;
