const { eventEmitter, EVENTS } = require('../eventEmitter');
const NotificationService = require('../../notifications/NotificationService');
const { getStaffUserIdsWithPermission } = require('../../notifications/notificationRecipients');
const logger = require('../../../config/logger');

function roleLabelAr(role) {
  const labels = {
    PATIENT: 'مريض',
    DOCTOR: 'طبيب',
    SUPER_ADMIN: 'مدير عام',
    MEDICAL_ADMIN: 'مدير طبي',
    INSURANCE_STAFF: 'موظف تأمين',
    SUPPORT_STAFF: 'دعم فني',
    ACCOUNTANT: 'محاسب',
  };
  return labels[role] || role;
}

function initUserListeners() {
  eventEmitter.on(EVENTS.USER.REGISTERED, async (user) => {
    try {
      if (!user?.id) return;

      const staffIds = await getStaffUserIdsWithPermission('users.list');
      const targets = staffIds.filter((id) => id !== user.id);
      if (!targets.length) return;

      const roleAr = roleLabelAr(user.role);
      const sourceAr = user.source === 'ADMIN_CREATE' ? ' (بواسطة الإدارة)' : '';

      await NotificationService.createBulk(
        targets.map((userId) => ({
          userId,
          titleAr: 'مستخدم جديد',
          titleEn: 'New user registered',
          bodyAr: `${user.fullName} — ${roleAr}${sourceAr}`,
          bodyEn: `${user.fullName} — ${user.role}${user.source === 'ADMIN_CREATE' ? ' (admin)' : ''}`,
          type: 'USER',
          relatedEntityType: 'User',
          relatedEntityId: user.id,
        })),
      );
      logger.info(`USER registration notifications sent for user ${user.id}`);
    } catch (error) {
      logger.error(`USER.REGISTERED listener failed: ${error.message}`);
    }
  });

  logger.info('User notification listeners initialized');
}

module.exports = initUserListeners;
