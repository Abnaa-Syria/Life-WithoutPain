const router = require('express').Router();
const NotificationController = require('./notification.controller');
const { authenticate } = require('../../middlewares/auth');

router.use(authenticate);

router.get('/', NotificationController.list);
router.get('/unread-count', NotificationController.unreadCount);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);

module.exports = router;
