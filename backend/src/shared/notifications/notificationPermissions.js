const { hasPermission } = require('../../modules/rbac/permission.service');

/** Notification types visible only when the user holds the mapped permission */
const NOTIFICATION_TYPE_PERMISSIONS = {
  APPOINTMENT: 'appointments.list',
  INSURANCE: 'insurance.cases.list',
  SUPPORT: 'support.tickets.list',
  PAYMENT: 'payments.list',
  SYSTEM: 'dashboard.view',
  CHAT: 'dashboard.view',
  LAB_RESULT: 'medical-master.list',
  PRESCRIPTION: 'prescriptions.admin.list',
  REPORT: 'reports.admin.list',
  REVIEW: 'reviews.moderate',
  VERIFICATION: 'doctors.list',
};

function permissionForNotificationType(type) {
  return NOTIFICATION_TYPE_PERMISSIONS[type] || 'dashboard.view';
}

function userCanReceiveType(permissions, type) {
  const required = permissionForNotificationType(type);
  return hasPermission(permissions, required);
}

function getAllowedNotificationTypes(permissions) {
  return Object.keys(NOTIFICATION_TYPE_PERMISSIONS).filter((type) =>
    userCanReceiveType(permissions, type),
  );
}

module.exports = {
  NOTIFICATION_TYPE_PERMISSIONS,
  permissionForNotificationType,
  userCanReceiveType,
  getAllowedNotificationTypes,
};
