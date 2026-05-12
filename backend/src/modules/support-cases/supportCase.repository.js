const BaseRepository = require('../../shared/repositories/BaseRepository');

class SupportCaseRepository extends BaseRepository {
  constructor() {
    super('supportCase');
  }
}
module.exports = new SupportCaseRepository();
