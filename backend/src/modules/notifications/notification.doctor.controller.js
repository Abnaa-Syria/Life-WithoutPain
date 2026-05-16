const NotificationService = require('./notification.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapNotification } = require('../../shared/utils/doctorAppMappers');

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await NotificationService.list(req.user.id, req.query);
  return paginatedResponse(res, {
    data: data.map(mapNotification),
    total,
    page,
    limit,
  });
});

const markRead = asyncHandler(async (req, res) => {
  const data = await NotificationService.markRead(req.params.id, req.user.id);
  return successResponse(res, { data, message: 'Notification marked as read' });
});

module.exports = { list, markRead };
