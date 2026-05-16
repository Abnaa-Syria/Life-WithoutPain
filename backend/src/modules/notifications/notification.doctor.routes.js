const router = require('express').Router();
const controller = require('./notification.doctor.controller');

router.get('/', controller.list);
router.patch('/:id/read', controller.markRead);

module.exports = router;
