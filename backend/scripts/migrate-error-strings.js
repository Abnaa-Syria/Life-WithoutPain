/**
 * One-time migration: replace hardcoded AppError messages with error codes.
 * Run: node scripts/migrate-error-strings.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src');

const REPLACEMENTS = [
  ["new NotFoundError('Patient profile not found')", "new NotFoundError('PATIENT_PROFILE_NOT_FOUND')"],
  ["new NotFoundError('Patient not found')", "new NotFoundError('PATIENT_NOT_FOUND')"],
  ["new NotFoundError('Doctor not found')", "new NotFoundError('DOCTOR_NOT_FOUND')"],
  ["new NotFoundError('Doctor profile not found')", "new NotFoundError('DOCTOR_PROFILE_NOT_FOUND')"],
  ["new NotFoundError('User not found')", "new NotFoundError('USER_NOT_FOUND')"],
  ["new NotFoundError('Appointment not found')", "new NotFoundError('APPOINTMENT_NOT_FOUND')"],
  ["new NotFoundError('Prescription not found')", "new NotFoundError('PRESCRIPTION_NOT_FOUND')"],
  ["new NotFoundError('Report not found')", "new NotFoundError('REPORT_NOT_FOUND')"],
  ["new NotFoundError('Lab test not found')", "new NotFoundError('LAB_TEST_NOT_FOUND')"],
  ["new NotFoundError('X-ray record not found')", "new NotFoundError('XRAY_NOT_FOUND')"],
  ["new NotFoundError('File not found')", "new NotFoundError('FILE_NOT_FOUND')"],
  ["new NotFoundError('Conversation not found')", "new NotFoundError('CONVERSATION_NOT_FOUND')"],
  ["new NotFoundError('Call session not found')", "new NotFoundError('CALL_SESSION_NOT_FOUND')"],
  ["new NotFoundError('Home service request not found')", "new NotFoundError('HOME_SERVICE_NOT_FOUND')"],
  ["new NotFoundError('Service not found')", "new NotFoundError('SERVICE_NOT_FOUND')"],
  ["new NotFoundError('Speciality not found')", "new NotFoundError('SPECIALITY_NOT_FOUND')"],
  ["new NotFoundError('Sub-speciality not found')", "new NotFoundError('SUB_SPECIALITY_NOT_FOUND')"],
  ["new NotFoundError('Insurance provider not found')", "new NotFoundError('INSURANCE_PROVIDER_NOT_FOUND')"],
  ["new NotFoundError('Insurance not found')", "new NotFoundError('INSURANCE_NOT_FOUND')"],
  ["new NotFoundError('Insurance case not found')", "new NotFoundError('INSURANCE_CASE_NOT_FOUND')"],
  ["new NotFoundError('Insurance request not found')", "new NotFoundError('INSURANCE_REQUEST_NOT_FOUND')"],
  ["new NotFoundError('Family member not found')", "new NotFoundError('FAMILY_MEMBER_NOT_FOUND')"],
  ["new NotFoundError('Medical profile not found')", "new NotFoundError('MEDICAL_PROFILE_NOT_FOUND')"],
  ["new NotFoundError('Attachment not found')", "new NotFoundError('ATTACHMENT_NOT_FOUND')"],
  ["new NotFoundError('Setting not found')", "new NotFoundError('SETTING_NOT_FOUND')"],
  ["new NotFoundError('Payment not found')", "new NotFoundError('PAYMENT_NOT_FOUND')"],
  ["new NotFoundError('Claim batch not found')", "new NotFoundError('CLAIM_BATCH_NOT_FOUND')"],
  ["new NotFoundError('Patient insurance not found')", "new NotFoundError('PATIENT_INSURANCE_NOT_FOUND')"],
  ["new NotFoundError('Audit log not found')", "new NotFoundError('AUDIT_LOG_NOT_FOUND')"],
  ["new NotFoundError('Manual notification not found')", "new NotFoundError('MANUAL_NOTIFICATION_NOT_FOUND')"],
  ["new NotFoundError('Availability slot not found')", "new NotFoundError('AVAILABILITY_SLOT_NOT_FOUND')"],
  ["new NotFoundError('Role not found')", "new NotFoundError('ROLE_NOT_FOUND')"],
  ["new NotFoundError('Lab test PDF not available')", "new NotFoundError('LAB_TEST_PDF_NOT_AVAILABLE')"],
  ["new ForbiddenError('You do not have access to this appointment')", "new ForbiddenError('APPOINTMENT_ACCESS_DENIED')"],
  ["new ForbiddenError('You do not have access to this prescription')", "new ForbiddenError('PRESCRIPTION_ACCESS_DENIED')"],
  ["new ForbiddenError('You do not have access to this report')", "new ForbiddenError('REPORT_ACCESS_DENIED')"],
  ["new ForbiddenError('You do not have access to this lab test')", "new ForbiddenError('LAB_TEST_ACCESS_DENIED')"],
  ["new ForbiddenError('You do not have access to this patient')", "new ForbiddenError('PATIENT_ACCESS_DENIED')"],
  ["new ForbiddenError('You do not have access to this file')", "new ForbiddenError('FILE_ACCESS_DENIED')"],
  ["new ForbiddenError('You do not have permission to access this resource')", "new ForbiddenError('PERMISSION_DENIED')"],
  ["new ForbiddenError('Account is not active')", "new ForbiddenError('ACCOUNT_NOT_ACTIVE')"],
  ["new UnauthorizedError('Access token is required')", "new UnauthorizedError('ACCESS_TOKEN_REQUIRED')"],
  ["new UnauthorizedError('User not found')", "new UnauthorizedError('USER_NOT_FOUND')"],
  ["new UnauthorizedError('Invalid or expired token')", "new UnauthorizedError('INVALID_TOKEN')"],
  ["new UnauthorizedError('Authentication required')", "new UnauthorizedError('AUTHENTICATION_REQUIRED')"],
  ["new UnauthorizedError('Invalid credentials')", "new UnauthorizedError('INVALID_CREDENTIALS')"],
  ["new UnauthorizedError('Account is not active')", "new UnauthorizedError('ACCOUNT_NOT_ACTIVE')"],
  ["new UnauthorizedError('Your account is pending admin approval')", "new UnauthorizedError('ACCOUNT_PENDING_APPROVAL')"],
  ["new UnauthorizedError('Invalid or expired refresh token')", "new UnauthorizedError('INVALID_REFRESH_TOKEN')"],
  ["new ConflictError('A user with this email or phone already exists')", "new ConflictError('USER_ALREADY_EXISTS')"],
  ["new BadRequestError('Invalid or expired OTP')", "new BadRequestError('INVALID_OTP')"],
  ["new BadRequestError('Please wait before requesting a new OTP')", "new BadRequestError('OTP_RATE_LIMITED')"],
  ["new BadRequestError('Current password is incorrect')", "new BadRequestError('CURRENT_PASSWORD_INCORRECT')"],
  ["new BadRequestError('Add an insurance policy before booking with medical insurance.')", "new BadRequestError('INSURANCE_REQUIRED_BEFORE_BOOKING')"],
  ["new BadRequestError('familyMemberId is required when booking for a family member')", "new BadRequestError('FAMILY_MEMBER_ID_REQUIRED')"],
  ["new BadRequestError('Home visits must be requested via POST /patient/home-services')", "new BadRequestError('HOME_VISIT_WRONG_ENDPOINT')"],
  ["new BadRequestError('Family member not found')", "new BadRequestError('FAMILY_MEMBER_NOT_FOUND_BOOKING')"],
  ["new BadRequestError('Doctor is not available for booking')", "new BadRequestError('DOCTOR_NOT_AVAILABLE')"],
  ["new BadRequestError('Selected time slot is not available')", "new BadRequestError('SLOT_NOT_AVAILABLE')"],
  ["new BadRequestError('This time slot is already booked')", "new BadRequestError('SLOT_ALREADY_BOOKED')"],
  ["new BadRequestError('status is required')", "new BadRequestError('STATUS_REQUIRED')"],
  ["new BadRequestError('Service must be a home visit type. Use POST /patient/appointments for clinic or remote visits.')", "new BadRequestError('SERVICE_NOT_HOME_VISIT')"],
  ["new BadRequestError('Invalid preferredDate')", "new BadRequestError('INVALID_PREFERRED_DATE')"],
  ["new BadRequestError('Request is already cancelled')", "new BadRequestError('HOME_SERVICE_ALREADY_CANCELLED')"],
  ["new BadRequestError('Cannot cancel a completed request')", "new BadRequestError('HOME_SERVICE_CANNOT_CANCEL_COMPLETED')"],
  ["new BadRequestError('At least one file is required')", "new BadRequestError('FILES_REQUIRED')"],
  ["new BadRequestError('Invalid catalog field')", "new BadRequestError('INVALID_CATALOG_FIELD')"],
  ["new BadRequestError('At least one prescription item is required')", "new BadRequestError('PRESCRIPTION_ITEMS_REQUIRED')"],
  ["new BadRequestError('fullName (or name) and relationType (or relation) are required')", "new BadRequestError('FAMILY_MEMBER_FIELDS_REQUIRED')"],
  ["new BadRequestError('gender must be MALE or FEMALE')", "new BadRequestError('GENDER_INVALID')"],
  ["new BadRequestError('language must be ar or en')", "new BadRequestError('LANGUAGE_INVALID')"],
  ["new BadRequestError('Invalid appointmentId for this patient')", "new BadRequestError('INVALID_APPOINTMENT_FOR_PATIENT')"],
  ["new BadRequestError('doctorId is required')", "new BadRequestError('DOCTOR_ID_REQUIRED')"],
  ["new BadRequestError('Invalid doctorId')", "new BadRequestError('INVALID_DOCTOR_ID')"],
  ["new BadRequestError('Provide exactly one of appointmentId or homeServiceRequestId')", "new BadRequestError('PAYMENT_TARGET_REQUIRED')"],
  ["new BadRequestError('Patient profile not found')", "new BadRequestError('PATIENT_PROFILE_NOT_FOUND')"],
  ["new BadRequestError('Appointment not found')", "new BadRequestError('APPOINTMENT_NOT_FOUND')"],
  ["new BadRequestError('No appointment found for this doctor to attach the record')", "new BadRequestError('DOCTOR_ATTACH_NO_APPOINTMENT')"],
  ["new BadRequestError('Appointment not found for this doctor and patient')", "new BadRequestError('DOCTOR_PATIENT_APPOINTMENT_NOT_FOUND')"],
  ["new BadRequestError('No appointment found for this doctor to attach the lab test')", "new BadRequestError('LAB_TEST_ATTACH_NO_APPOINTMENT')"],
  ["new BadRequestError('Provide userId or targetAudience')", "new BadRequestError('NOTIFICATION_TARGET_REQUIRED')"],
  ["new BadRequestError('Invalid role in targetAudience')", "new BadRequestError('NOTIFICATION_TARGET_AUDIENCE_INVALID')"],
  ["new BadRequestError('Bilingual title and body are required')", "new BadRequestError('NOTIFICATION_BILINGUAL_REQUIRED')"],
  ["new BadRequestError('No recipients found for the selected audience')", "new BadRequestError('NOTIFICATION_NO_RECIPIENTS')"],
  ["new BadRequestError('Role name must be at least 2 characters (e.g. CUSTOM_ROLE)')", "new BadRequestError('ROLE_NAME_TOO_SHORT')"],
  ["new BadRequestError('Role name already exists')", "new BadRequestError('ROLE_NAME_EXISTS')"],
  ["new BadRequestError('specializationId is required when subSpecializationIds are provided')", "new BadRequestError('SPECIALIZATION_ID_REQUIRED')"],
  ["new BadRequestError('One or more sub-specialization IDs are invalid for the selected specialization')", "new BadRequestError('SUB_SPECIALIZATION_IDS_INVALID')"],
  ["new ForbiddenError('This account must sign in through the admin portal.')", "new ForbiddenError('ADMIN_PORTAL_REQUIRED')"],
  ["new ForbiddenError('This account cannot sign in to the patient app. Use the doctor app or contact support.')", "new ForbiddenError('PATIENT_APP_FORBIDDEN')"],
  ["new ForbiddenError('System role name cannot be changed')", "new ForbiddenError('SYSTEM_ROLE_NAME_LOCKED')"],
  ["new ForbiddenError('System roles cannot be deleted')", "new ForbiddenError('SYSTEM_ROLE_DELETE_FORBIDDEN')"],
  ["new ForbiddenError('SUPER_ADMIN permissions cannot be modified')", "new ForbiddenError('SUPER_ADMIN_PERMISSIONS_LOCKED')"],
  ["new ForbiddenError('Cannot change your own role without roles.manage')", "new ForbiddenError('CANNOT_CHANGE_OWN_ROLE')"],
  ["new ForbiddenError('Cannot demote the last active SUPER_ADMIN')", "new ForbiddenError('LAST_SUPER_ADMIN')"],
  ["new ForbiddenError('Cannot revoke your own roles.manage permission')", "new ForbiddenError('CANNOT_REVOKE_OWN_ROLES_MANAGE')"],
  ["new ValidationError('Medical license number is required')", "new ValidationError('MEDICAL_LICENSE_REQUIRED')"],
  ["new ValidationError('Invalid medical license expiry date')", "new ValidationError('INVALID_LICENSE_EXPIRY')"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'i18n' && entry.name !== 'locales') {
      walk(p, files);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(p);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(SRC)) {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content;
  for (const [from, to] of REPLACEMENTS) {
    updated = updated.split(from).join(to);
  }
  if (updated !== content) {
    fs.writeFileSync(file, updated);
    changed++;
  }
}
console.log(`Updated ${changed} files`);
