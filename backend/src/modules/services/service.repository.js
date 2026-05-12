const BaseRepository = require('../../shared/repositories/BaseRepository');

class ServiceRepository extends BaseRepository {
  constructor() {
    super('service');
  }
}
module.exports = new ServiceRepository();
