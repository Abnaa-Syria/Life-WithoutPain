const BaseRepository = require('../../shared/repositories/BaseRepository');

class ClaimItemRepository extends BaseRepository {
  constructor() {
    super('claimItem');
  }
}
module.exports = new ClaimItemRepository();
