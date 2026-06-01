const { eventEmitter, EVENTS } = require('../eventEmitter');
const NotificationService = require('../../notifications/NotificationService');
const { getStaffUserIdsForNotificationType } = require('../../notifications/notificationRecipients');
const logger = require('../../../config/logger');

function initSupportListeners() {
  eventEmitter.on(EVENTS.SUPPORT.TICKET_CREATED, async (ticket) => {
    try {
      const staffIds = await getStaffUserIdsForNotificationType('SUPPORT');
      if (!staffIds.length) return;

      const notifications = staffIds.map((userId) => ({
        userId,
        titleAr: 'تذكرة دعم جديدة',
        titleEn: 'New support ticket',
        bodyAr: ticket.subject,
        bodyEn: ticket.subject,
        type: 'SUPPORT',
        relatedEntityType: 'SupportTicket',
        relatedEntityId: ticket.id,
      }));
      await NotificationService.createBulk(notifications);
      logger.info(`Support notifications sent to staff for ticket ${ticket.id}`);
    } catch (error) {
      logger.error(`Support TICKET_CREATED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.SUPPORT.MESSAGE_RECEIVED, async ({ ticket, message }) => {
    try {
      const creatorId = ticket.createdByUserId;
      if (!creatorId) return;
      await NotificationService.create({
        userId: creatorId,
        titleAr: 'رد من فريق الدعم',
        titleEn: 'Support team replied',
        bodyAr: message?.content?.slice(0, 200) || ticket.subject,
        bodyEn: message?.content?.slice(0, 200) || ticket.subject,
        type: 'SUPPORT',
        relatedEntityType: 'SupportTicket',
        relatedEntityId: ticket.id,
      });
      logger.info(`Support reply notification sent to user ${creatorId}`);
    } catch (error) {
      logger.error(`Support MESSAGE_RECEIVED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.SUPPORT.USER_REPLIED, async ({ ticket, message }) => {
    try {
      const staffIds = await getStaffUserIdsForNotificationType('SUPPORT');
      if (!staffIds.length) return;

      const preview = message?.content?.slice(0, 200) || ticket.subject;
      await NotificationService.createBulk(
        staffIds.map((userId) => ({
          userId,
          titleAr: 'رد جديد على تذكرة دعم',
          titleEn: 'New reply on support ticket',
          bodyAr: `#${ticket.id}: ${preview}`,
          bodyEn: `#${ticket.id}: ${preview}`,
          type: 'SUPPORT',
          relatedEntityType: 'SupportTicket',
          relatedEntityId: ticket.id,
        })),
      );
      logger.info(`Support USER_REPLIED notifications for ticket ${ticket.id}`);
    } catch (error) {
      logger.error(`Support USER_REPLIED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.SUPPORT.STATUS_CHANGED, async ({ ticket }) => {
    try {
      const creatorId = ticket.createdByUserId;
      if (!creatorId) return;
      await NotificationService.create({
        userId: creatorId,
        titleAr: 'تحديث حالة تذكرة الدعم',
        titleEn: 'Support ticket status updated',
        bodyAr: `تم تحديث الحالة إلى ${ticket.status}`,
        bodyEn: `Status updated to ${ticket.status}`,
        type: 'SUPPORT',
        relatedEntityType: 'SupportTicket',
        relatedEntityId: ticket.id,
      });
      logger.info(`Support status notification sent to user ${creatorId}`);
    } catch (error) {
      logger.error(`Support STATUS_CHANGED listener failed: ${error.message}`);
    }
  });

  logger.info('Support notification listeners initialized');
}

module.exports = initSupportListeners;
