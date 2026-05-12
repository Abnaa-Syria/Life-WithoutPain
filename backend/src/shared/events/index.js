const initNotificationListeners = require('./listeners/notification.listener');
const logger = require('../../config/logger');

function initEvents() {
  logger.info('Initializing application event system...');
  initNotificationListeners();
  // Initialize other listeners here
}

module.exports = initEvents;
