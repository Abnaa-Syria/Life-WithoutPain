const NotificationRepository = require('./notification.repository');
const { buildPagination } = require('../../utils/pagination');

class NotificationService {
  static async list(userId, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = { userId };
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

  static async markAllRead(userId) {
    return NotificationRepository.model.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

module.exports = NotificationService;
