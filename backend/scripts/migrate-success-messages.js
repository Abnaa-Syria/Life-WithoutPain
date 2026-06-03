const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src');

const REPLACEMENTS = [
  ["message: 'Patient registered successfully. Please verify your phone with OTP.'", "messageKey: 'PATIENT_REGISTERED'"],
  ["message: 'Doctor registered successfully. Please verify your phone with OTP.'", "messageKey: 'DOCTOR_REGISTERED'"],
  ["message: 'Login successful'", "messageKey: 'LOGIN_SUCCESS'"],
  ["message: 'OTP verified successfully'", "messageKey: 'OTP_VERIFIED'"],
  ["message: 'OTP verified'", "messageKey: 'OTP_VERIFIED'"],
  ["message: 'OTP resent successfully'", "messageKey: 'OTP_RESENT'"],
  ["message: 'Token refreshed successfully'", "messageKey: 'TOKEN_REFRESHED'"],
  ["message: 'Password reset OTP sent'", "messageKey: 'PASSWORD_RESET_OTP_SENT'"],
  ["message: 'Password reset successful'", "messageKey: 'PASSWORD_RESET_SUCCESS'"],
  ["message: 'Password changed successfully'", "messageKey: 'PASSWORD_CHANGED'"],
  ["message: 'Logged out successfully'", "messageKey: 'LOGOUT_SUCCESS'"],
  ["message: 'Profile fetched successfully'", "messageKey: 'PROFILE_FETCHED'"],
  ["message: 'Profile updated successfully'", "messageKey: 'PROFILE_UPDATED'"],
  ["message: 'Profile updated'", "messageKey: 'PROFILE_UPDATED'"],
  ["message: 'Account deleted successfully'", "messageKey: 'ACCOUNT_DELETED'"],
  ["message: 'Settings updated successfully'", "messageKey: 'SETTINGS_UPDATED'"],
  ["message: 'Settings updated'", "messageKey: 'SETTINGS_UPDATED'"],
  ["message: 'Medical profile fetched successfully'", "messageKey: 'MEDICAL_PROFILE_FETCHED'"],
  ["message: 'Medical profile updated successfully'", "messageKey: 'MEDICAL_PROFILE_UPDATED'"],
  ["message: 'Attachments fetched successfully'", "messageKey: 'ATTACHMENTS_FETCHED'"],
  ["message: 'Attachments uploaded successfully'", "messageKey: 'ATTACHMENTS_UPLOADED'"],
  ["message: 'Attachment deleted successfully'", "messageKey: 'ATTACHMENT_DELETED'"],
  ["message: 'Family members fetched successfully'", "messageKey: 'FAMILY_MEMBERS_FETCHED'"],
  ["message: 'Family member added successfully'", "messageKey: 'FAMILY_MEMBER_ADDED'"],
  ["message: 'Family member updated successfully'", "messageKey: 'FAMILY_MEMBER_UPDATED'"],
  ["message: 'Family member updated'", "messageKey: 'FAMILY_MEMBER_UPDATED'"],
  ["message: 'Family member removed successfully'", "messageKey: 'FAMILY_MEMBER_REMOVED'"],
  ["message: 'Family member deleted'", "messageKey: 'FAMILY_MEMBER_DELETED'"],
  ["message: 'Insurances fetched successfully'", "messageKey: 'INSURANCES_FETCHED'"],
  ["message: 'Insurance linked successfully'", "messageKey: 'INSURANCE_LINKED'"],
  ["message: 'Insurance updated successfully'", "messageKey: 'INSURANCE_UPDATED'"],
  ["message: 'Insurance updated'", "messageKey: 'INSURANCE_UPDATED'"],
  ["message: 'Insurance removed successfully'", "messageKey: 'INSURANCE_REMOVED'"],
  ["message: 'Insurance removed'", "messageKey: 'INSURANCE_REMOVED'"],
  ["message: 'Medical files fetched successfully'", "messageKey: 'MEDICAL_FILES_FETCHED'"],
  ["message: 'File uploaded successfully'", "messageKey: 'FILE_UPLOADED'"],
  ["message: 'Dashboard summary fetched successfully'", "messageKey: 'DASHBOARD_FETCHED'"],
  ["message: 'Appointment created'", "messageKey: 'APPOINTMENT_CREATED'"],
  ["message: 'Appointment confirmed'", "messageKey: 'APPOINTMENT_CONFIRMED'"],
  ["message: 'Appointment cancelled'", "messageKey: 'APPOINTMENT_CANCELLED'"],
  ["message: 'Appointment rescheduled'", "messageKey: 'APPOINTMENT_RESCHEDULED'"],
  ["message: 'Home service request submitted'", "messageKey: 'HOME_SERVICE_SUBMITTED'"],
  ["message: 'Home service request cancelled'", "messageKey: 'HOME_SERVICE_CANCELLED'"],
  ["message: 'Prescription created'", "messageKey: 'PRESCRIPTION_CREATED'"],
  ["message: 'Report created'", "messageKey: 'REPORT_CREATED'"],
  ["message: 'Availability saved'", "messageKey: 'AVAILABILITY_SAVED'"],
  ["message: 'Clinic details updated'", "messageKey: 'CLINIC_DETAILS_UPDATED'"],
  ["message: 'Speciality deleted'", "messageKey: 'SPECIALITY_DELETED'"],
  ["message: 'Service deleted'", "messageKey: 'SERVICE_DELETED'"],
  ["message: 'Provider deleted'", "messageKey: 'PROVIDER_DELETED'"],
  ["message: 'Setting deleted'", "messageKey: 'SETTING_DELETED'"],
  ["message: 'Doctor deactivated'", "messageKey: 'DOCTOR_DEACTIVATED'"],
  ["message: 'Doctor approved'", "messageKey: 'DOCTOR_APPROVED'"],
  ["message: 'Doctor rejected'", "messageKey: 'DOCTOR_REJECTED'"],
  ["message: 'Batch submitted'", "messageKey: 'BATCH_SUBMITTED'"],
  ["message: 'Insurance case approved'", "messageKey: 'INSURANCE_CASE_APPROVED'"],
  ["message: 'Insurance case rejected'", "messageKey: 'INSURANCE_CASE_REJECTED'"],
  ["message: 'More information requested'", "messageKey: 'INSURANCE_MORE_INFO'"],
  ["message: 'Insurance approval updated'", "messageKey: 'INSURANCE_APPROVAL_UPDATED'"],
  ["message: 'Case escalated'", "messageKey: 'CASE_ESCALATED'"],
  ["message: 'Case assigned'", "messageKey: 'CASE_ASSIGNED'"],
  ["message: 'Status updated'", "messageKey: 'STATUS_UPDATED'"],
  ["message: 'Ticket assigned'", "messageKey: 'TICKET_ASSIGNED'"],
  ["message: 'Support information updated'", "messageKey: 'SUPPORT_INFO_UPDATED'"],
  ["message: 'Support ticket created'", "messageKey: 'SUPPORT_TICKET_CREATED'"],
  ["message: 'Message sent'", "messageKey: 'MESSAGE_SENT'"],
  ["message: 'Notification marked as read'", "messageKey: 'NOTIFICATION_READ'"],
  ["message: 'All notifications marked as read'", "messageKey: 'NOTIFICATIONS_READ_ALL'"],
  ["message: 'Notifications sent'", "messageKey: 'NOTIFICATIONS_SENT'"],
  ["message: 'Notifications resent'", "messageKey: 'NOTIFICATIONS_RESENT'"],
  ["message: 'Notification campaign removed'", "messageKey: 'NOTIFICATION_CAMPAIGN_REMOVED'"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(p);
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
