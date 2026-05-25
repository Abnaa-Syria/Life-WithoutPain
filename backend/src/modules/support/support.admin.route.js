const router = require('express').Router();
const controller = require('./support.admin.controller');
const { authenticate } = require('../../middlewares/auth');
const { guard, SUPPORT, SUPER } = require('../admin/admin.permissions');
const { validate } = require('../../middlewares/validate');
const { uploadMultiple } = require('../../middlewares/upload');
const {
  ticketIdParamSchema,
  listTicketsQuerySchema,
  adminUpdateStatusSchema,
  adminAssignSchema,
  updateSupportInfoSchema,
  ticketMessageSchema,
} = require('./supportTicket.validator');

router.use(authenticate);

router.get('/info', guard('support.tickets.info', ...SUPER), controller.getInfo);
router.patch('/info', guard('support.tickets.info', ...SUPER), validate(updateSupportInfoSchema), controller.updateInfo);

router.get('/tickets', guard('support.tickets.list', ...SUPPORT), validate(listTicketsQuerySchema, 'query'), controller.listTickets);
router.get('/tickets/:id', guard('support.tickets.read', ...SUPPORT), validate(ticketIdParamSchema, 'params'), controller.getTicket);
router.patch('/tickets/:id/status', guard('support.tickets.manage', ...SUPPORT), validate(ticketIdParamSchema, 'params'), validate(adminUpdateStatusSchema), controller.updateStatus);
router.patch('/tickets/:id/assign', guard('support.tickets.manage', ...SUPPORT), validate(ticketIdParamSchema, 'params'), validate(adminAssignSchema), controller.assignTicket);
router.post(
  '/tickets/:id/messages',
  guard('support.tickets.manage', ...SUPPORT),
  validate(ticketIdParamSchema, 'params'),
  uploadMultiple('files', 5),
  validate(ticketMessageSchema),
  controller.addMessage,
);

module.exports = router;
