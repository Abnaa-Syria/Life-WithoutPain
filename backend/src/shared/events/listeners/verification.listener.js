const { eventEmitter, EVENTS } = require('../eventEmitter');
const NotificationService = require('../../notifications/NotificationService');
const { getStaffUserIdsForNotificationType } = require('../../notifications/notificationRecipients');
const logger = require('../../../config/logger');

function initVerificationListeners() {
  eventEmitter.on(EVENTS.VERIFICATION.DOCTOR_SUBMITTED, async ({ doctorProfile, user }) => {
    try {
      const staffIds = await getStaffUserIdsForNotificationType('VERIFICATION');
      if (!staffIds.length) return;

      const name = user?.fullName || 'طبيب';
      await NotificationService.createBulk(
        staffIds.map((userId) => ({
          userId,
          titleAr: 'طلب تحقق طبيب جديد',
          titleEn: 'New doctor verification request',
          bodyAr: `${name} بانتظار المراجعة`,
          bodyEn: `${name} is pending verification`,
          type: 'VERIFICATION',
          relatedEntityType: 'DoctorProfile',
          relatedEntityId: doctorProfile.id,
        })),
      );
      logger.info(`Verification submitted notifications for doctor ${doctorProfile.id}`);
    } catch (error) {
      logger.error(`VERIFICATION.DOCTOR_SUBMITTED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.VERIFICATION.DOCTOR_APPROVED, async ({ doctorProfile, userId }) => {
    try {
      if (!userId) return;
      await NotificationService.create({
        userId,
        titleAr: 'تم قبول حسابك',
        titleEn: 'Account approved',
        bodyAr: 'تم التحقق من حسابك بنجاح ويمكنك الآن استقبال المواعيد.',
        bodyEn: 'Your account has been verified. You can now receive appointments.',
        type: 'VERIFICATION',
        relatedEntityType: 'DoctorProfile',
        relatedEntityId: doctorProfile?.id,
      });
      logger.info(`Verification approved notification for user ${userId}`);
    } catch (error) {
      logger.error(`VERIFICATION.DOCTOR_APPROVED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.VERIFICATION.DOCTOR_REJECTED, async ({ doctorProfile, userId, reason }) => {
    try {
      if (!userId) return;
      const reasonSuffix = reason ? ` — ${reason}` : '';
      await NotificationService.create({
        userId,
        titleAr: 'تم رفض طلب التحقق',
        titleEn: 'Verification rejected',
        bodyAr: `لم يتم قبول طلب التحقق الخاص بك${reasonSuffix}`,
        bodyEn: `Your verification request was not approved${reasonSuffix}`,
        type: 'VERIFICATION',
        relatedEntityType: 'DoctorProfile',
        relatedEntityId: doctorProfile?.id,
      });
      logger.info(`Verification rejected notification for user ${userId}`);
    } catch (error) {
      logger.error(`VERIFICATION.DOCTOR_REJECTED listener failed: ${error.message}`);
    }
  });

  logger.info('Verification notification listeners initialized');
}

module.exports = initVerificationListeners;
