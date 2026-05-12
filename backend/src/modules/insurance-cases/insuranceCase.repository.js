const BaseRepository = require('../../shared/repositories/BaseRepository');

class InsuranceCaseRepository extends BaseRepository {
  constructor() {
    super('insuranceCase');
  }
}
module.exports = new InsuranceCaseRepository();
