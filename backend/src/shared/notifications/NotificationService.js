const prisma = require('../../config/database');
const logger = require('../../config/logger');
const TranslationRepository = require('../../i18n/TranslationRepository');
const { normalizeTranslationsInput, pickLocalized } = require('../../i18n/mapLocalized');
const {
  emitNotificationCreated,
  emitNotificationsCreated,
} = require('../../socket/notification.emit');

const ENTITY_TYPE = 'notification';

function resolveTranslations(payload) {
  const fromBody = normalizeTranslationsInput(payload);
  if (fromBody) return fromBody;
  if (payload.titleAr || payload.titleEn || payload.bodyAr || payload.bodyEn) {
    return {
      ar: { title: payload.titleAr, body: payload.bodyAr },
      en: { title: payload.titleEn, body: payload.bodyEn },
    };
  }
  return null;
}

async function persistTranslations(notificationId, translations) {
  if (translations) {
    await TranslationRepository.upsertSet(ENTITY_TYPE, notificationId, translations);
  }
}

function bilingualFieldsFromMap(translationMap, notificationId) {
  const tr = translationMap.get(notificationId) || {};
  return {
    titleAr: pickLocalized(tr, 'ar', 'title'),
    titleEn: pickLocalized(tr, 'en', 'title'),
    bodyAr: pickLocalized(tr, 'ar', 'body'),
    bodyEn: pickLocalized(tr, 'en', 'body'),
  };
}

class NotificationService {
  static async create(payload) {
    try {
      const translations = resolveTranslations(payload);
      const {
        userId,
        type,
        relatedEntityType,
        relatedEntityId,
        source = 'SYSTEM_EVENT',
        targetAudience = null,
        createdByAdminId = null,
        batchId = null,
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
        translations: _t,
        ...rest
      } = payload;

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          source,
          targetAudience,
          createdByAdminId,
          batchId,
          relatedEntityType: relatedEntityType || null,
          relatedEntityId: relatedEntityId || null,
          ...rest,
        },
      });
      await persistTranslations(notification.id, translations);
      const enriched = await this.enrichNotification(notification);
      emitNotificationCreated(enriched);
      return enriched;
    } catch (error) {
      logger.error({ msg: 'Failed to create notification', error: error.message });
      return null;
    }
  }

  static async createBulk(notifications) {
    if (!notifications?.length) return { count: 0 };
    try {
      const created = [];
      for (const n of notifications) {
        const row = await this.create(n);
        if (row) created.push(row);
      }
      emitNotificationsCreated(created);
      return { count: created.length };
    } catch (error) {
      logger.error({ msg: 'Failed to create bulk notifications', error: error.message });
      return null;
    }
  }

  static async enrichNotifications(notifications) {
    if (!notifications?.length) return [];
    const ids = notifications.map((n) => n.id);
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, ids);
    return notifications.map((n) => ({
      ...n,
      ...bilingualFieldsFromMap(map, n.id),
    }));
  }

  static async enrichNotification(notification) {
    if (!notification?.id) return notification;
    const [enriched] = await this.enrichNotifications([notification]);
    return enriched;
  }

  static async loadTranslationsForNotifications(notifications) {
    const ids = notifications.map((n) => n.id);
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, ids);
    return notifications.map((n) => {
      const translations = map.get(n.id) || {};
      return {
        ...n,
        _translations: translations,
        title: null,
        body: null,
      };
    });
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
