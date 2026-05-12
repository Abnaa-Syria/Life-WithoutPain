const BaseRepository = require('../../shared/repositories/BaseRepository');

class DoctorVerificationDocumentRepository extends BaseRepository {
  constructor() {
    super('doctorVerificationDocument');
  }
}

module.exports = new DoctorVerificationDocumentRepository();
