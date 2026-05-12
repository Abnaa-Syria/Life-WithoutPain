const BaseRepository = require('../../shared/repositories/BaseRepository');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notification');
  }
}
module.exports = new NotificationRepository();
