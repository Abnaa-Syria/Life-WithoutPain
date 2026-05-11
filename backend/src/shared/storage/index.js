const config = require('../../config');
const LocalStorage = require('./LocalStorage');

const getStorageProvider = () => {
  switch (config.storage.provider) {
    case 'local':
    default:
      return new LocalStorage();
  }
};

module.exports = getStorageProvider();
