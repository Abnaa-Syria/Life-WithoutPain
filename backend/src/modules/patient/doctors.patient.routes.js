const router = require('express').Router();
const controller = require('./doctors.patient.controller');

router.get('/search', controller.search);
router.get('/:id/availability', controller.getAvailability);
router.get('/:id', controller.getById);

module.exports = router;
