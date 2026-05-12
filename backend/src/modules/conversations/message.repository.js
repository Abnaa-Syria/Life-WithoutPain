const BaseRepository = require('../../shared/repositories/BaseRepository');

class MessageRepository extends BaseRepository {
  constructor() {
    super('message');
  }
}
module.exports = new MessageRepository();
