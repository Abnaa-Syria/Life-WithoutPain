const router = require('express').Router();
const controller = require('./specializations.patient.controller');

router.get('/', controller.list);
router.get('/:id/doctors', controller.getDoctors);

module.exports = router;
