const BaseRepository = require('../../shared/repositories/BaseRepository');

class SpecialityRepository extends BaseRepository {
  constructor() {
    super('speciality');
  }
}

module.exports = new SpecialityRepository();
