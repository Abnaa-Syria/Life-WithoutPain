const NotificationRepository = require('./notification.repository');
const { buildPagination } = require('../../utils/pagination');
const { getAllowedNotificationTypes } = require('../../shared/notifications/notificationPermissions');

class NotificationService {
  static async list(userId, query, permissions = []) {
    const { page, limit, skip } = buildPagination(query);
    const allowedTypes = getAllowedNotificationTypes(permissions);
    const where = {
      userId,
      type: { in: allowedTypes },
    };
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

    const [data, total] = await Promise.all([
      NotificationRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      NotificationRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async markRead(id, userId) {
    return NotificationRepository.update({
      where: { id: parseInt(id), userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllRead(userId, permissions = []) {
    const allowedTypes = getAllowedNotificationTypes(permissions);
    return NotificationRepository.model.updateMany({
      where: { userId, isRead: false, type: { in: allowedTypes } },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async unreadCount(userId, permissions = []) {
    const allowedTypes = getAllowedNotificationTypes(permissions);
    return NotificationRepository.count({
      where: { userId, isRead: false, type: { in: allowedTypes } },
    });
  }
}

module.exports = NotificationService;
