const SupportTicketService = require('./supportTicket.service');
const SupportInfoService = require('./supportInfo.service');
const {
  mapSupportInfo,
  mapTicketDetail,
  mapTicketAdminListItem,
  mapMessage,
} = require('./support.mapper');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { createAuditLog } = require('../../middlewares/auditLog');

const getInfo = asyncHandler(async (req, res) => {
  const data = await SupportInfoService.getAdminInfo();
  return successResponse(res, { data });
});

const updateInfo = asyncHandler(async (req, res) => {
  const data = await SupportInfoService.updateAdminInfo(req.body, req.user.id);
  createAuditLog({
    actorId: req.user.id,
    entityType: 'SupportContactInfo',
    entityId: 1,
    action: 'UPDATE',
    newValues: req.body,
    req,
  });
  return successResponse(res, { data, message: 'Support information updated' });
});

const listTickets = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await SupportTicketService.listTicketsAdmin({
    ...req.query,
    adminUserId: req.user.id,
  });
  const mapped = data.map(({ ticket, unreadCount }) =>
    mapTicketAdminListItem(ticket, unreadCount),
  );
  return paginatedResponse(res, { data: mapped, total, page, limit });
});

const getTicket = asyncHandler(async (req, res) => {
  const { ticket, unreadCount } = await SupportTicketService.getTicketAdmin(
    req.params.id,
    req.user.id,
  );
  return successResponse(res, { data: mapTicketDetail(ticket, unreadCount) });
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await SupportTicketService.updateStatus(req.params.id, req.body, req.user.id);
  createAuditLog({
    actorId: req.user.id,
    entityType: 'SupportCase',
    entityId: data.id,
    action: 'STATUS_CHANGE',
    newValues: req.body,
    req,
  });
  return successResponse(res, { data: mapTicketDetail(data), message: 'Status updated' });
});

const assignTicket = asyncHandler(async (req, res) => {
  const assignedId = req.body.assignedAdminId || req.body.assignedTo;
  const data = await SupportTicketService.assignTicket(req.params.id, assignedId);
  createAuditLog({
    actorId: req.user.id,
    entityType: 'SupportCase',
    entityId: data.id,
    action: 'ASSIGN',
    newValues: { assignedTo: assignedId },
    req,
  });
  return successResponse(res, { data: mapTicketDetail(data), message: 'Ticket assigned' });
});

const addMessage = asyncHandler(async (req, res) => {
  const data = await SupportTicketService.addMessage({
    ticketId: req.params.id,
    senderId: req.user.id,
    senderRole: req.user.role,
    body: req.body,
    files: req.files,
  });
  return createdResponse(res, { data: mapMessage(data), message: 'Message sent' });
});

module.exports = {
  getInfo,
  updateInfo,
  listTickets,
  getTicket,
  updateStatus,
  assignTicket,
  addMessage,
};
