const router = require('express').Router();
const controller = require('./profile.patient.controller');

router.get('/', controller.getProfile);
router.put('/', controller.updateProfile);

module.exports = router;
