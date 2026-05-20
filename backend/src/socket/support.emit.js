const { mapMessage, mapTicketDetail } = require('../modules/support/support.mapper');

let io = null;

function setSocketServer(server) {
  io = server;
}

function ticketRoom(ticketId) {
  return `support:ticket:${ticketId}`;
}

function emitSupportMessage(ticketId, messageRecord) {
  if (!io) return;
  const message = mapMessage(messageRecord);
  io.to(ticketRoom(ticketId)).emit('support:message', {
    ticketId: Number(ticketId),
    message,
  });
}

function emitSupportStatusChanged(ticketRecord, unreadCount = 0) {
  if (!io) return;
  io.to(ticketRoom(ticketRecord.id)).emit('support:status', {
    ticketId: ticketRecord.id,
    status: ticketRecord.status,
    ticket: mapTicketDetail(ticketRecord, unreadCount),
  });
}

module.exports = {
  setSocketServer,
  ticketRoom,
  emitSupportMessage,
  emitSupportStatusChanged,
};
