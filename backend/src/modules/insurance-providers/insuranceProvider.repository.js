const BaseRepository = require('../../shared/repositories/BaseRepository');

class InsuranceProviderRepository extends BaseRepository {
  constructor() {
    super('insuranceProvider');
  }
}
module.exports = new InsuranceProviderRepository();
