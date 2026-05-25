const router = require('express').Router();
const controller = require('./insurance-requests.patient.controller');

router.get('/', controller.list);
router.get('/:id', controller.getById);

module.exports = router;
