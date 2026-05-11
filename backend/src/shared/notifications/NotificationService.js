const prisma = require('../../config/database');
const logger = require('../../config/logger');

class NotificationService {
  static async create({ userId, titleAr, titleEn, bodyAr, bodyEn, type, relatedEntityType, relatedEntityId }) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          titleAr,
          titleEn,
          bodyAr,
          bodyEn,
          type,
          relatedEntityType: relatedEntityType || null,
          relatedEntityId: relatedEntityId || null,
        },
      });
    } catch (error) {
      logger.error({ msg: 'Failed to create notification', error: error.message });
      return null;
    }
  }

  static async createBulk(notifications) {
    try {
      return await prisma.notification.createMany({ data: notifications });
    } catch (error) {
      logger.error({ msg: 'Failed to create bulk notifications', error: error.message });
      return null;
    }
  }

  static async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

module.exports = NotificationService;
