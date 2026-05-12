const BaseRepository = require('../../shared/repositories/BaseRepository');

class PatientRepository extends BaseRepository {
  constructor() {
    super('patientProfile');
  }
}

module.exports = new PatientRepository();
