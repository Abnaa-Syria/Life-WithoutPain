const router = require('express').Router();
const controller = require('./doctorProfile.doctor.controller');

router.get('/', controller.getClinicDetails);
router.patch('/', controller.updateClinicDetails);

module.exports = router;
