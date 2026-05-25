const prisma = require('../../config/database');
const logger = require('../../config/logger');
const {
  emitNotificationCreated,
  emitNotificationsCreated,
} = require('../../socket/notification.emit');

class NotificationService {
  static async create({ userId, titleAr, titleEn, bodyAr, bodyEn, type, relatedEntityType, relatedEntityId }) {
    try {
      const notification = await prisma.notification.create({
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
      emitNotificationCreated(notification);
      return notification;
    } catch (error) {
      logger.error({ msg: 'Failed to create notification', error: error.message });
      return null;
    }
  }

  static async createBulk(notifications) {
    if (!notifications?.length) return { count: 0 };
    try {
      const created = await prisma.$transaction(
        notifications.map((n) =>
          prisma.notification.create({
            data: {
              userId: n.userId,
              titleAr: n.titleAr,
              titleEn: n.titleEn,
              bodyAr: n.bodyAr,
              bodyEn: n.bodyEn,
              type: n.type,
              relatedEntityType: n.relatedEntityType || null,
              relatedEntityId: n.relatedEntityId || null,
            },
          }),
        ),
      );
      emitNotificationsCreated(created);
      return { count: created.length };
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
