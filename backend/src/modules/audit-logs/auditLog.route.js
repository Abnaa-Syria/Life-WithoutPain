const router = require('express').Router();
const AuditLogController = require('./auditLog.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/', AuditLogController.list);

module.exports = router;
