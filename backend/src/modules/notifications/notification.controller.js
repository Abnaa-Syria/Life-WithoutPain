const NotificationService = require('./notification.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class NotificationController {
  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await NotificationService.list(
      req.user.id,
      req.query,
      req.user.permissions,
      req.user.role,
    );
    return paginatedResponse(res, { data, total, page, limit });
  });

  static markRead = asyncHandler(async (req, res) => {
    await NotificationService.markRead(req.params.id, req.user.id);
    return successResponse(res, { data: null, message: 'Notification marked as read' });
  });

  static markAllRead = asyncHandler(async (req, res) => {
    await NotificationService.markAllRead(req.user.id, req.user.permissions, req.user.role);
    return successResponse(res, { data: null, message: 'All notifications marked as read' });
  });

  static unreadCount = asyncHandler(async (req, res) => {
    const count = await NotificationService.unreadCount(req.user.id, req.user.permissions, req.user.role);
    return successResponse(res, { data: { count } });
  });
}

module.exports = NotificationController;
