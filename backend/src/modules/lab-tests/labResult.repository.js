const BaseRepository = require('../../shared/repositories/BaseRepository');

class LabResultRepository extends BaseRepository {
  constructor() {
    super('labResult');
  }
}
module.exports = new LabResultRepository();
