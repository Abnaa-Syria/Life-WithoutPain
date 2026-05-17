const router = require('express').Router();
const controller = require('./payments.patient.controller');

router.post('/initiate', controller.initiate);
router.get('/', controller.list);
router.get('/:id', controller.getById);

module.exports = router;
