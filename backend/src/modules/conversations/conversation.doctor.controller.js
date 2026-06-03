const ConversationService = require('./conversation.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const getChat = asyncHandler(async (req, res) => {
  const data = await ConversationService.getAppointmentChatForDoctor(req.user.id, req.params.id, req.query);
  return successResponse(res, { data });
});

const sendMessage = asyncHandler(async (req, res) => {
  const data = await ConversationService.sendAppointmentMessageForDoctor(req.user.id, req.params.id, req.body);
  return createdResponse(res, { data, messageKey: 'MESSAGE_SENT' });
});

module.exports = { getChat, sendMessage };
