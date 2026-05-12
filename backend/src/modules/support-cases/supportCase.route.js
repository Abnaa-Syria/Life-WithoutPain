const router = require('express').Router();
const SupportCaseController = require('./supportCase.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.post('/', SupportCaseController.create);
router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF), SupportCaseController.list);
router.get('/:id', SupportCaseController.getById);
router.patch('/:id/assign', authorize(ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF), SupportCaseController.assign);
router.patch('/:id/status', authorize(ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF), SupportCaseController.updateStatus);
router.get('/:id/messages', SupportCaseController.getMessages);
router.post('/:id/messages', SupportCaseController.addMessage);

module.exports = router;
