const initNotificationListeners = require('./listeners/notification.listener');
const initSupportListeners = require('./listeners/support.listener');
const initInsuranceListeners = require('./listeners/insurance.listener');
const initUserListeners = require('./listeners/user.listener');
const initVerificationListeners = require('./listeners/verification.listener');
const initPaymentListeners = require('./listeners/payment.listener');
const logger = require('../../config/logger');

function initEvents() {
  logger.info('Initializing application event system...');
  initNotificationListeners();
  initSupportListeners();
  initInsuranceListeners();
  initUserListeners();
  initVerificationListeners();
  initPaymentListeners();
}

module.exports = initEvents;
