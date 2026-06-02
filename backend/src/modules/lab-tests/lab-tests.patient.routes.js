const router = require('express').Router();
const controller = require('./labTest.patient.controller');

router.get('/', controller.list);
router.get('/:id/pdf', controller.getPdf);
router.get('/:id/results', controller.getResults);
router.get('/:id', controller.getById);

module.exports = router;
