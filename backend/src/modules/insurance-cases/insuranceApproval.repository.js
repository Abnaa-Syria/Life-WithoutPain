const BaseRepository = require('../../shared/repositories/BaseRepository');

class InsuranceApprovalRepository extends BaseRepository {
  constructor() {
    super('insuranceApproval');
  }
}
module.exports = new InsuranceApprovalRepository();
