const router = require('express').Router();
const controller = require('./availability.doctor.controller');

router.get('/', controller.list);
router.post('/', controller.create);

module.exports = router;
