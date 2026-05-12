const BaseRepository = require('../../shared/repositories/BaseRepository');

class ConversationRepository extends BaseRepository {
  constructor() {
    super('conversation');
  }
}
module.exports = new ConversationRepository();
