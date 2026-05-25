const { Server } = require('socket.io');
const config = require('../config');
const logger = require('../config/logger');
const { authenticateSocketToken } = require('./auth');
const { registerSupportSocketHandlers } = require('./support.socket');
const { setSocketServer } = require('./support.emit');
const { registerNotificationSocketHandlers } = require('./notification.socket');
const { setNotificationSocketServer } = require('./notification.emit');

function initSocket(httpServer) {
  const corsOrigin = config.env === 'development'
    ? true
    : (Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin]);

  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      const user = await authenticateSocketToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  registerSupportSocketHandlers(io);
  registerNotificationSocketHandlers(io);
  setSocketServer(io);
  setNotificationSocketServer(io);

  logger.info({ msg: 'Socket.IO initialized', path: '/socket.io' });
  return io;
}

module.exports = { initSocket };
