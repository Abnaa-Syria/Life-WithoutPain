const initNotificationListeners = require('./listeners/notification.listener');
const initSupportListeners = require('./listeners/support.listener');
const logger = require('../../config/logger');

function initEvents() {
  logger.info('Initializing application event system...');
  initNotificationListeners();
  initSupportListeners();
}

module.exports = initEvents;
