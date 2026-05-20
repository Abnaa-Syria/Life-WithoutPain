const router = require('express').Router();
const controller = require('./support.doctor.controller');
const { validate } = require('../../middlewares/validate');
const { uploadMultiple } = require('../../middlewares/upload');
const {
  createTicketSchema,
  ticketMessageSchema,
  ticketIdParamSchema,
  listTicketsQuerySchema,
} = require('../support/supportTicket.validator');

router.get('/info', controller.getInfo);

const ticketRouter = require('express').Router({ mergeParams: true });
ticketRouter.get('/', validate(listTicketsQuerySchema, 'query'), controller.listTickets);
ticketRouter.post('/', uploadMultiple('files', 5), validate(createTicketSchema), controller.createTicket);
ticketRouter.get('/:id', validate(ticketIdParamSchema, 'params'), controller.getTicket);
ticketRouter.post(
  '/:id/messages',
  validate(ticketIdParamSchema, 'params'),
  uploadMultiple('files', 5),
  validate(ticketMessageSchema),
  controller.addMessage,
);

router.use('/tickets', ticketRouter);
router.use('/cases', ticketRouter);

module.exports = router;
