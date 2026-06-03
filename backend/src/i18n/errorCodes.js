/**
 * Maps stable error codes to HTTP status codes.
 * Message text lives in locales/{lng}/errors.json
 */
const ERROR_META = {
  // Generic HTTP
  BAD_REQUEST: { status: 400 },
  UNAUTHORIZED: { status: 401 },
  FORBIDDEN: { status: 403 },
  NOT_FOUND: { status: 404 },
  CONFLICT: { status: 409 },
  VALIDATION_ERROR: { status: 422 },
  VALIDATION_FAILED: { status: 422 },
  RATE_LIMITED: { status: 429 },
  AUTH_RATE_LIMITED: { status: 429 },
  PERMISSION_ACTION_DENIED: { status: 403 },
  INVALID_TARGET_AUDIENCE: { status: 400 },
  INTERNAL_ERROR: { status: 500 },
  ROUTE_NOT_FOUND: { status: 404 },

  // Auth
  ACCESS_TOKEN_REQUIRED: { status: 401 },
  INVALID_TOKEN: { status: 401 },
  TOKEN_EXPIRED: { status: 401 },
  INVALID_CREDENTIALS: { status: 401 },
  ACCOUNT_NOT_ACTIVE: { status: 401 },
  ACCOUNT_PENDING_APPROVAL: { status: 401 },
  INVALID_REFRESH_TOKEN: { status: 401 },
  AUTHENTICATION_REQUIRED: { status: 401 },
  USER_NOT_FOUND: { status: 404 },
  INVALID_OTP: { status: 400 },
  OTP_RATE_LIMITED: { status: 400 },
  CURRENT_PASSWORD_INCORRECT: { status: 400 },
  USER_ALREADY_EXISTS: { status: 409 },
  MEDICAL_LICENSE_REQUIRED: { status: 422 },
  INVALID_LICENSE_EXPIRY: { status: 422 },
  ADMIN_PORTAL_REQUIRED: { status: 403 },
  PATIENT_APP_FORBIDDEN: { status: 403 },

  // RBAC
  PERMISSION_DENIED: { status: 403 },
  ROLE_NOT_FOUND: { status: 404 },
  ROLE_NAME_TOO_SHORT: { status: 400 },
  ROLE_NAME_EXISTS: { status: 400 },
  SYSTEM_ROLE_NAME_LOCKED: { status: 403 },
  SYSTEM_ROLE_DELETE_FORBIDDEN: { status: 403 },
  SUPER_ADMIN_PERMISSIONS_LOCKED: { status: 403 },
  RBAC_ROLE_UNDEFINED: { status: 400 },
  RBAC_ROLE_NOT_IN_ENUM: { status: 400 },
  FILE_TYPE_NOT_ALLOWED: { status: 400 },
  RBAC_PERMISSIONS_INVALID: { status: 400 },
  CANNOT_CHANGE_OWN_ROLE: { status: 403 },
  LAST_SUPER_ADMIN: { status: 403 },
  CANNOT_REVOKE_OWN_ROLES_MANAGE: { status: 403 },

  // Profiles & resources
  PATIENT_PROFILE_NOT_FOUND: { status: 404 },
  PATIENT_NOT_FOUND: { status: 404 },
  DOCTOR_NOT_FOUND: { status: 404 },
  DOCTOR_PROFILE_NOT_FOUND: { status: 404 },
  ENTITY_NOT_FOUND: { status: 404 },
  APPOINTMENT_NOT_FOUND: { status: 404 },
  PRESCRIPTION_NOT_FOUND: { status: 404 },
  REPORT_NOT_FOUND: { status: 404 },
  LAB_TEST_NOT_FOUND: { status: 404 },
  XRAY_NOT_FOUND: { status: 404 },
  FILE_NOT_FOUND: { status: 404 },
  CONVERSATION_NOT_FOUND: { status: 404 },
  CALL_SESSION_NOT_FOUND: { status: 404 },
  HOME_SERVICE_NOT_FOUND: { status: 404 },
  SERVICE_NOT_FOUND: { status: 404 },
  SPECIALITY_NOT_FOUND: { status: 404 },
  SUB_SPECIALITY_NOT_FOUND: { status: 404 },
  INSURANCE_PROVIDER_NOT_FOUND: { status: 404 },
  INSURANCE_NOT_FOUND: { status: 404 },
  INSURANCE_CASE_NOT_FOUND: { status: 404 },
  INSURANCE_REQUEST_NOT_FOUND: { status: 404 },
  FAMILY_MEMBER_NOT_FOUND: { status: 404 },
  MEDICAL_PROFILE_NOT_FOUND: { status: 404 },
  ATTACHMENT_NOT_FOUND: { status: 404 },
  SETTING_NOT_FOUND: { status: 404 },
  PAYMENT_NOT_FOUND: { status: 404 },
  CLAIM_BATCH_NOT_FOUND: { status: 404 },
  PATIENT_INSURANCE_NOT_FOUND: { status: 404 },
  AUDIT_LOG_NOT_FOUND: { status: 404 },
  MANUAL_NOTIFICATION_NOT_FOUND: { status: 404 },
  LAB_TEST_PDF_NOT_AVAILABLE: { status: 404 },

  // Access
  APPOINTMENT_ACCESS_DENIED: { status: 403 },
  PRESCRIPTION_ACCESS_DENIED: { status: 403 },
  REPORT_ACCESS_DENIED: { status: 403 },
  LAB_TEST_ACCESS_DENIED: { status: 403 },
  PATIENT_ACCESS_DENIED: { status: 403 },
  FILE_ACCESS_DENIED: { status: 403 },

  // Appointments & booking
  INSURANCE_REQUIRED_BEFORE_BOOKING: { status: 400 },
  FAMILY_MEMBER_ID_REQUIRED: { status: 400 },
  HOME_VISIT_WRONG_ENDPOINT: { status: 400 },
  FAMILY_MEMBER_NOT_FOUND_BOOKING: { status: 400 },
  DOCTOR_NOT_AVAILABLE: { status: 400 },
  SLOT_NOT_AVAILABLE: { status: 400 },
  SLOT_ALREADY_BOOKED: { status: 400 },
  APPOINTMENT_STATUS_TRANSITION_INVALID: { status: 400 },
  STATUS_REQUIRED: { status: 400 },

  // Home services
  SERVICE_NOT_HOME_VISIT: { status: 400 },
  INVALID_PREFERRED_DATE: { status: 400 },
  HOME_SERVICE_ALREADY_CANCELLED: { status: 400 },
  HOME_SERVICE_CANNOT_CANCEL_COMPLETED: { status: 400 },

  // Medical profile
  CATALOG_IDS_INVALID: { status: 400 },
  FILES_REQUIRED: { status: 400 },
  INVALID_CATALOG_FIELD: { status: 400 },
  PRESCRIPTION_ITEMS_REQUIRED: { status: 400 },

  // Patient / doctor
  FAMILY_MEMBER_FIELDS_REQUIRED: { status: 400 },
  GENDER_INVALID: { status: 400 },
  LANGUAGE_INVALID: { status: 400 },
  SUB_SPECIALIZATION_IDS_INVALID: { status: 400 },
  SPECIALIZATION_ID_REQUIRED: { status: 400 },
  AVAILABILITY_SLOT_NOT_FOUND: { status: 404 },
  DOCTOR_ATTACH_NO_APPOINTMENT: { status: 400 },
  DOCTOR_PATIENT_APPOINTMENT_NOT_FOUND: { status: 400 },

  // Conversations & payments
  INVALID_APPOINTMENT_FOR_PATIENT: { status: 400 },
  DOCTOR_ID_REQUIRED: { status: 400 },
  INVALID_DOCTOR_ID: { status: 400 },
  PAYMENT_TARGET_REQUIRED: { status: 400 },

  // Files
  FILE_CATEGORY_INVALID: { status: 400 },

  // Lab tests
  LAB_TEST_STATUS_INVALID: { status: 400 },
  LAB_TEST_ATTACH_NO_APPOINTMENT: { status: 400 },

  // Notifications admin
  NOTIFICATION_TARGET_REQUIRED: { status: 400 },
  NOTIFICATION_TARGET_AUDIENCE_INVALID: { status: 400 },
  NOTIFICATION_BILINGUAL_REQUIRED: { status: 400 },
  NOTIFICATION_NO_RECIPIENTS: { status: 400 },

  // Prisma
  DUPLICATE_ENTRY: { status: 409 },

  // Health
  API_RUNNING: { status: 200 },
};

function getStatusForCode(errorCode) {
  return ERROR_META[errorCode]?.status ?? 500;
}

module.exports = {
  ERROR_META,
  getStatusForCode,
};
