const BaseRepository = require('../../shared/repositories/BaseRepository');

class ClaimBatchRepository extends BaseRepository {
  constructor() {
    super('claimBatch');
  }
}
module.exports = new ClaimBatchRepository();
