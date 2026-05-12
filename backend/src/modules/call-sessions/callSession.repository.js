const BaseRepository = require('../../shared/repositories/BaseRepository');

class CallSessionRepository extends BaseRepository {
  constructor() {
    super('callSession');
  }
}
module.exports = new CallSessionRepository();
