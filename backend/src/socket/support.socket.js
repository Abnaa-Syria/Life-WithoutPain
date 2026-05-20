const SupportTicketService = require('../modules/support/supportTicket.service');
const { ticketRoom } = require('./support.emit');
const logger = require('../config/logger');

function registerSupportSocketHandlers(io) {
  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info({ msg: 'Socket connected', userId: user.id, role: user.role });

    socket.on('support:join', async (payload, callback) => {
      try {
        const ticketId = payload?.ticketId;
        if (!ticketId) {
          throw new Error('ticketId is required');
        }

        const ticket = await SupportTicketService.getTicketRaw(ticketId);
        await SupportTicketService.assertTicketAccess(ticket, user.id, user.role);

        await socket.join(ticketRoom(ticketId));
        if (typeof callback === 'function') {
          callback({ ok: true, ticketId: Number(ticketId) });
        }
      } catch (error) {
        logger.warn({ msg: 'support:join denied', userId: user.id, error: error.message });
        if (typeof callback === 'function') {
          callback({ ok: false, message: error.message });
        }
      }
    });

    socket.on('support:leave', (payload) => {
      const ticketId = payload?.ticketId;
      if (ticketId) {
        socket.leave(ticketRoom(ticketId));
      }
    });

    socket.on('disconnect', () => {
      logger.debug({ msg: 'Socket disconnected', userId: user.id });
    });
  });
}

module.exports = { registerSupportSocketHandlers };
