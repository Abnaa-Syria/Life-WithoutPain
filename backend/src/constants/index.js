const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
  MEDICAL_ADMIN: 'MEDICAL_ADMIN',
  INSURANCE_STAFF: 'INSURANCE_STAFF',
  SUPPORT_STAFF: 'SUPPORT_STAFF',
  ACCOUNTANT: 'ACCOUNTANT',
};

const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.MEDICAL_ADMIN,
  ROLES.INSURANCE_STAFF,
  ROLES.SUPPORT_STAFF,
  ROLES.ACCOUNTANT,
];

const STAFF_ROLES = [...ADMIN_ROLES];

/** Values allowed on User.role (Prisma UserRole enum) */
const USER_ROLE_ENUM = Object.values(ROLES);

const APPOINTMENT_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  RESCHEDULED: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  NO_SHOW: [],
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

module.exports = {
  ROLES,
  ADMIN_ROLES,
  STAFF_ROLES,
  USER_ROLE_ENUM,
  APPOINTMENT_STATUS_TRANSITIONS,
  PAGINATION,
  FILE_TYPES,
};
