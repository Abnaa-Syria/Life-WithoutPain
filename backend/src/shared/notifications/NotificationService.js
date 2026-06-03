const prisma = require('../../config/database');
const logger = require('../../config/logger');
const {
  emitNotificationCreated,
  emitNotificationsCreated,
} = require('../../socket/notification.emit');

class NotificationService {
  static async create({
    userId,
    titleAr,
    titleEn,
    bodyAr,
    bodyEn,
    type,
    relatedEntityType,
    relatedEntityId,
    source = 'SYSTEM_EVENT',
    targetAudience = null,
    createdByAdminId = null,
    batchId = null,
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          titleAr,
          titleEn,
          bodyAr,
          bodyEn,
          type,
          source,
          targetAudience,
          createdByAdminId,
          batchId,
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
              source: n.source || 'SYSTEM_EVENT',
              targetAudience: n.targetAudience || null,
              createdByAdminId: n.createdByAdminId || null,
              batchId: n.batchId || null,
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
