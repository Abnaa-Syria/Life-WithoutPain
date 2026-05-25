const { eventEmitter, EVENTS } = require('../eventEmitter');
const NotificationService = require('../../notifications/NotificationService');
const { getStaffUserIdsForNotificationType } = require('../../notifications/notificationRecipients');
const logger = require('../../../config/logger');

/**
 * Initialize all notification listeners
 */
function initNotificationListeners() {
  eventEmitter.on(EVENTS.APPOINTMENT.CREATED, async (appointment) => {
    try {
      const staffIds = await getStaffUserIdsForNotificationType('APPOINTMENT');
      const doctorUserId = appointment?.doctor?.userId;

      const targets = new Set(staffIds);
      if (doctorUserId) targets.add(doctorUserId);

      if (!targets.size) return;

      const dateLabel = appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toLocaleString()
        : '';

      await NotificationService.createBulk(
        [...targets].map((userId) => ({
          userId,
          titleAr: 'موعد جديد',
          titleEn: 'New Appointment',
          bodyAr: `موعد جديد${dateLabel ? ` في ${dateLabel}` : ''}`,
          bodyEn: `New appointment${dateLabel ? ` on ${dateLabel}` : ''}`,
          type: 'APPOINTMENT',
          relatedEntityType: 'Appointment',
          relatedEntityId: appointment.id,
        })),
      );
      logger.info(`Notifications sent for appointment ${appointment.id}`);
    } catch (error) {
      logger.error(`Failed to send notification for appointment ${appointment.id}: ${error.message}`);
    }
  });

  logger.info('Notification listeners initialized');
}

module.exports = initNotificationListeners;
