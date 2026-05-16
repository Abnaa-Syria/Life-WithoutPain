const router = require('express').Router();
const controller = require('./prescription.doctor.controller');

router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.get('/:id/pdf', controller.getPdf);

module.exports = router;
