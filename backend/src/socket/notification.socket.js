const logger = require('../config/logger');
const { userNotificationRoom } = require('./notification.emit');

function registerNotificationSocketHandlers(io) {
  io.on('connection', (socket) => {
    const user = socket.data.user;
    const room = userNotificationRoom(user.id);
    socket.join(room);
    logger.debug({ msg: 'Notification room joined', userId: user.id, room });
  });
}

module.exports = { registerNotificationSocketHandlers };
