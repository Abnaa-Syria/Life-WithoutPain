const ConversationService = require('../conversations/conversation.service');
const { resolvePatientProfile } = require('../../shared/utils/patientAppContext');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await ConversationService.list(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const create = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  const data = await ConversationService.create({
    patientId,
    doctorId: req.body.doctorId,
    appointmentId: req.body.appointmentId,
  });
  return createdResponse(res, { data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await ConversationService.getById(req.params.id);
  return successResponse(res, { data });
});

const getMessages = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await ConversationService.getMessages(req.params.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const sendMessage = asyncHandler(async (req, res) => {
  const data = await ConversationService.sendMessage(req.params.id, req.user.id, req.body);
  return createdResponse(res, { data });
});

const markRead = asyncHandler(async (req, res) => {
  const data = await ConversationService.markMessageRead(req.params.messageId);
  return successResponse(res, { data });
});

module.exports = { list, create, getById, getMessages, sendMessage, markRead };
