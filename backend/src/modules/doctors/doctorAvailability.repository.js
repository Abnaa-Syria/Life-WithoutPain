const BaseRepository = require('../../shared/repositories/BaseRepository');

class DoctorAvailabilityRepository extends BaseRepository {
  constructor() {
    super('doctorAvailability');
  }
}

module.exports = new DoctorAvailabilityRepository();
