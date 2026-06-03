const NotificationsAdminService = require('./notifications.admin.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');

class NotificationsAdminController {
  static async listManual(req, res) {
    const { data, total, page, limit } = await NotificationsAdminService.listManual(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  }

  static async getManual(req, res) {
    const data = await NotificationsAdminService.getManual(req.params.id);
    return successResponse(res, { data });
  }

  static async sendManual(req, res) {
    const result = await NotificationsAdminService.sendManual(req.user.id, req.body);
    return createdResponse(res, { data: result, messageKey: 'NOTIFICATIONS_SENT' });
  }

  static async resendManual(req, res) {
    const result = await NotificationsAdminService.resendManual(req.user.id, req.params.id);
    return successResponse(res, { data: result, messageKey: 'NOTIFICATIONS_RESENT' });
  }

  static async deleteManual(req, res) {
    const result = await NotificationsAdminService.deleteManual(req.params.id);
    return successResponse(res, { data: result, messageKey: 'NOTIFICATION_CAMPAIGN_REMOVED' });
  }

  static async searchUsers(req, res) {
    const { data, total, page, limit } = await NotificationsAdminService.searchUsers(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  }
}

module.exports = NotificationsAdminController;
