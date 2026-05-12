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
  NOTIFICATION: {
    SEND: 'notification.send',
  },
};

module.exports = {
  eventEmitter,
  EVENTS,
};
