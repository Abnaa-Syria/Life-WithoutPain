const router = require('express').Router();
const controller = require('./support.admin.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const { uploadMultiple } = require('../../middlewares/upload');
const { ROLES } = require('../../constants');
const {
  ticketIdParamSchema,
  listTicketsQuerySchema,
  adminUpdateStatusSchema,
  adminAssignSchema,
  updateSupportInfoSchema,
  ticketMessageSchema,
} = require('./supportTicket.validator');

const SUPPORT_ADMIN = [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF];

router.use(authenticate, authorize(...SUPPORT_ADMIN));

router.get('/info', controller.getInfo);
router.patch('/info', validate(updateSupportInfoSchema), controller.updateInfo);

router.get('/tickets', validate(listTicketsQuerySchema, 'query'), controller.listTickets);
router.get('/tickets/:id', validate(ticketIdParamSchema, 'params'), controller.getTicket);
router.patch('/tickets/:id/status', validate(ticketIdParamSchema, 'params'), validate(adminUpdateStatusSchema), controller.updateStatus);
router.patch('/tickets/:id/assign', validate(ticketIdParamSchema, 'params'), validate(adminAssignSchema), controller.assignTicket);
router.post(
  '/tickets/:id/messages',
  validate(ticketIdParamSchema, 'params'),
  uploadMultiple('files', 5),
  validate(ticketMessageSchema),
  controller.addMessage,
);

module.exports = router;
