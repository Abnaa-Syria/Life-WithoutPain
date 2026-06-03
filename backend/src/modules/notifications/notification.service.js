const prisma = require('../../config/database');
const NotificationRepository = require('./notification.repository');
const { buildPagination } = require('../../utils/pagination');
const { getAllowedNotificationTypes } = require('../../shared/notifications/notificationPermissions');
const { STAFF_ROLES } = require('../../constants');

function resolveAllowedTypes(role, permissions) {
  if (!STAFF_ROLES.includes(role)) return null;
  return getAllowedNotificationTypes(permissions);
}

function buildWhere(userId, allowedTypes, extra = {}) {
  const where = { userId, ...extra };
  if (allowedTypes) {
    where.type = { in: allowedTypes };
  }
  return where;
}

class NotificationService {
  static async list(userId, query, permissions = [], role = null) {
    const { page, limit, skip } = buildPagination(query);
    const allowedTypes = resolveAllowedTypes(role, permissions);
    const where = buildWhere(userId, allowedTypes);
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

    const [data, total] = await Promise.all([
      NotificationRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      NotificationRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async listForDoctor(userId, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = { userId };
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async markRead(id, userId) {
    return NotificationRepository.update({
      where: { id: parseInt(id), userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllRead(userId, permissions = [], role = null) {
    const allowedTypes = resolveAllowedTypes(role, permissions);
    return NotificationRepository.model.updateMany({
      where: buildWhere(userId, allowedTypes, { isRead: false }),
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async unreadCount(userId, permissions = [], role = null) {
    const allowedTypes = resolveAllowedTypes(role, permissions);
    return NotificationRepository.count({
      where: buildWhere(userId, allowedTypes, { isRead: false }),
    });
  }
}

module.exports = NotificationService;
