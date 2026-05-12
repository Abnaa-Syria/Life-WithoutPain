const router = require('express').Router();
const ConversationController = require('./conversation.controller');
const { authenticate } = require('../../middlewares/auth');

router.use(authenticate);

router.get('/', ConversationController.list);
router.post('/', ConversationController.create);
router.get('/:id', ConversationController.getById);
router.get('/:id/messages', ConversationController.getMessages);
router.post('/:id/messages', ConversationController.sendMessage);
router.patch('/:id/messages/:messageId/read', ConversationController.markMessageRead);

module.exports = router;
