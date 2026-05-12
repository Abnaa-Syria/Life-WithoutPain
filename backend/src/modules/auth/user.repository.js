const BaseRepository = require('../../shared/repositories/BaseRepository');

class UserRepository extends BaseRepository {
  constructor() {
    super('user');
  }
}

module.exports = new UserRepository();
