const SupportTicketService = require('../support/supportTicket.service');
const SupportInfoService = require('../support/supportInfo.service');
const {
  mapSupportInfo,
  mapTicketListItem,
  mapTicketDetail,
  mapMessage,
} = require('../support/support.mapper');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { ROLES } = require('../../constants');

const getInfo = asyncHandler(async (req, res) => {
  const lang = req.query.lang || req.user?.preferredLanguage || 'ar';
  const data = await SupportInfoService.getPublicInfo(lang);
  return successResponse(res, { data });
});

const listTickets = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await SupportTicketService.listTicketsForUser(
    req.user.id,
    ROLES.PATIENT,
    req.query,
  );
  const mapped = data.map(({ ticket, unreadCount }) => mapTicketListItem(ticket, unreadCount));
  return paginatedResponse(res, { data: mapped, total, page, limit });
});

const createTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicketService.createTicket({
    userId: req.user.id,
    role: ROLES.PATIENT,
    body: req.body,
    files: req.files,
  });
  return createdResponse(res, {
    data: mapTicketDetail(ticket, 0),
    messageKey: 'SUPPORT_TICKET_CREATED',
  });
});

const getTicket = asyncHandler(async (req, res) => {
  const { ticket, unreadCount } = await SupportTicketService.getTicketForUser(
    req.user.id,
    ROLES.PATIENT,
    req.params.id,
  );
  return successResponse(res, { data: mapTicketDetail(ticket, unreadCount) });
});

const addMessage = asyncHandler(async (req, res) => {
  const data = await SupportTicketService.addMessage({
    ticketId: req.params.id,
    senderId: req.user.id,
    senderRole: ROLES.PATIENT,
    body: req.body,
    files: req.files,
  });
  return createdResponse(res, { data: mapMessage(data), messageKey: 'MESSAGE_SENT' });
});

module.exports = {
  getInfo,
  listTickets,
  createTicket,
  getTicket,
  addMessage,
};
