const router = require('express').Router();
const controller = require('./report.doctor.controller');

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.get('/:id/pdf', controller.getPdf);

module.exports = router;
