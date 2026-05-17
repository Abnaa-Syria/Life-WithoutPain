const router = require('express').Router();
const controller = require('./directories.patient.controller');

router.get('/', controller.list);

module.exports = router;
