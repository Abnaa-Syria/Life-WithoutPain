const BaseRepository = require('../../shared/repositories/BaseRepository');

class SupportMessageRepository extends BaseRepository {
  constructor() {
    super('supportMessage');
  }
}
module.exports = new SupportMessageRepository();
