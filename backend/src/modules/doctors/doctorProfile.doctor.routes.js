const router = require('express').Router();
const controller = require('./doctorProfile.doctor.controller');

router.get('/', controller.getProfile);
router.patch('/', controller.updateProfile);

module.exports = router;
