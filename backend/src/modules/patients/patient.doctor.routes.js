const router = require('express').Router();
const controller = require('./patient.doctor.controller');

router.get('/', controller.list);
router.get('/:id', controller.getOne);

module.exports = router;
