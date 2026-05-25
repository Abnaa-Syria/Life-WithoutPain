let io = null;

function setNotificationSocketServer(server) {
  io = server;
}

function userNotificationRoom(userId) {
  return `notifications:user:${userId}`;
}

function emitNotificationCreated(notification) {
  if (!io || !notification?.userId) return;
  io.to(userNotificationRoom(notification.userId)).emit('notification:new', {
    notification,
  });
}

function emitNotificationsCreated(notifications) {
  if (!io || !notifications?.length) return;
  for (const notification of notifications) {
    emitNotificationCreated(notification);
  }
}

module.exports = {
  setNotificationSocketServer,
  userNotificationRoom,
  emitNotificationCreated,
  emitNotificationsCreated,
};
