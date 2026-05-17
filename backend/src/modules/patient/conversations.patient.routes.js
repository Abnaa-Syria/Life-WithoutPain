const router = require('express').Router();
const controller = require('./conversations.patient.controller');

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.get('/:id/messages', controller.getMessages);
router.post('/:id/messages', controller.sendMessage);
router.patch('/:id/messages/:messageId/read', controller.markRead);

module.exports = router;
