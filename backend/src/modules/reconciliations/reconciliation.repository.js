const BaseRepository = require('../../shared/repositories/BaseRepository');

class ReconciliationRepository extends BaseRepository {
  constructor() {
    super('reconciliation');
  }
}
module.exports = new ReconciliationRepository();
