const BaseRepository = require('../../shared/repositories/BaseRepository');

class LabTestRepository extends BaseRepository {
  constructor() {
    super('labTestRequest');
  }
}
module.exports = new LabTestRepository();
