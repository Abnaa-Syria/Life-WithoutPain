const BaseRepository = require('../../shared/repositories/BaseRepository');

class PrescriptionRepository extends BaseRepository {
  constructor() {
    super('prescription');
  }
}
module.exports = new PrescriptionRepository();
