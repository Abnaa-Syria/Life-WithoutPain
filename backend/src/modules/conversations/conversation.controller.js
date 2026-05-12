const ConversationService = require('./conversation.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class ConversationController {
  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await ConversationService.list(req.user.id, req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await ConversationService.create(req.body);
    return createdResponse(res, { data });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await ConversationService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static getMessages = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await ConversationService.getMessages(req.params.id, req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static sendMessage = asyncHandler(async (req, res) => {
    const data = await ConversationService.sendMessage(req.params.id, req.user.id, req.body);
    return createdResponse(res, { data });
  });

  static markMessageRead = asyncHandler(async (req, res) => {
    const data = await ConversationService.markMessageRead(req.params.messageId);
    return successResponse(res, { data });
  });
}

module.exports = ConversationController;
