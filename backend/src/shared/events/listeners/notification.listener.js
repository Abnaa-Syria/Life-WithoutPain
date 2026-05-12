const { eventEmitter, EVENTS } = require('../eventEmitter');
const NotificationService = require('../../notifications/NotificationService');
const logger = require('../../../config/logger');

/**
 * Initialize all notification listeners
 */
function initNotificationListeners() {
  // Listen for new appointments
  eventEmitter.on(EVENTS.APPOINTMENT.CREATED, async (appointment) => {
    try {
      await NotificationService.create({
        userId: appointment.doctor.userId,
        titleAr: 'موعد جديد',
        titleEn: 'New Appointment',
        bodyAr: `لديك موعد جديد في ${appointment.appointmentDate}`,
        bodyEn: `You have a new appointment on ${appointment.appointmentDate}`,
        type: 'APPOINTMENT',
        relatedEntityType: 'Appointment',
        relatedEntityId: appointment.id,
      });
      logger.info(`Notification sent for appointment ${appointment.id}`);
    } catch (error) {
      logger.error(`Failed to send notification for appointment ${appointment.id}: ${error.message}`);
    }
  });

  // Add more listeners as needed
  logger.info('Notification listeners initialized');
}

module.exports = initNotificationListeners;
