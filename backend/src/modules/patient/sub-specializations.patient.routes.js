const router = require('express').Router();
const controller = require('./specializations.patient.controller');

router.get('/', controller.listSubSpecializations);

module.exports = router;
