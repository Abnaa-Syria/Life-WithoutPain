const router = require('express').Router();
const controller = require('./doctorProfile.doctor.controller');

router.get('/', controller.getSettings);
router.patch('/', controller.updateSettings);

module.exports = router;
