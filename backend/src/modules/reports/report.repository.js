const BaseRepository = require('../../shared/repositories/BaseRepository');

class MedicalReportRepository extends BaseRepository {
  constructor() {
    super('medicalReport');
  }
}
module.exports = new MedicalReportRepository();
