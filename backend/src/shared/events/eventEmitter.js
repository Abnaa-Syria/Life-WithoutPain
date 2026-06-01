const EventEmitter = require('events');
const logger = require('../../config/logger');

class AppEventEmitter extends EventEmitter {
  emit(event, ...args) {
    logger.debug(`Event emitted: ${event}`);
    return super.emit(event, ...args);
  }
}

const eventEmitter = new AppEventEmitter();

// Event names constants
const EVENTS = {
  APPOINTMENT: {
    CREATED: 'appointment.created',
    UPDATED: 'appointment.updated',
    STATUS_CHANGED: 'appointment.status_changed',
    CANCELLED: 'appointment.cancelled',
  },
  USER: {
    REGISTERED: 'user.registered',
    VERIFIED: 'user.verified',
  },
  INSURANCE: {
    CASE_CREATED: 'insurance.case_created',
    CASE_UPDATED: 'insurance.case_updated',
  },
  SUPPORT: {
    TICKET_CREATED: 'support.ticket.created',
    MESSAGE_RECEIVED: 'support.message.received',
    STATUS_CHANGED: 'support.status.changed',
    USER_REPLIED: 'support.user.replied',
  },
  PAYMENT: {
    COMPLETED: 'payment.completed',
    FAILED: 'payment.failed',
  },
  VERIFICATION: {
    DOCTOR_SUBMITTED: 'verification.doctor_submitted',
    DOCTOR_APPROVED: 'verification.doctor_approved',
    DOCTOR_REJECTED: 'verification.doctor_rejected',
  },
  CHAT: {
    MESSAGE_SENT: 'chat.message_sent',
  },
  LAB_RESULT: {
    CREATED: 'lab_result.created',
  },
  PRESCRIPTION: {
    CREATED: 'prescription.created',
  },
  REPORT: {
    CREATED: 'report.created',
  },
  REVIEW: {
    CREATED: 'review.created',
  },
};

module.exports = {
  eventEmitter,
  EVENTS,
};
