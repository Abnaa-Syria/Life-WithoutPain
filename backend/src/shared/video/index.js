const config = require('../../config');
const MockVideoProvider = require('./MockVideoProvider');

const getVideoProvider = () => {
  switch (config.video.provider) {
    case 'mock':
    default:
      return new MockVideoProvider();
  }
};

module.exports = getVideoProvider();
