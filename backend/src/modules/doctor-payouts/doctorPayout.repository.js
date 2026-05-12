const BaseRepository = require('../../shared/repositories/BaseRepository');

class DoctorPayoutRepository extends BaseRepository {
  constructor() {
    super('doctorPayout');
  }

  async aggregateForDoctor(doctorId, aggregateParams) {
    return this.model.aggregate({
      where: { doctorId },
      ...aggregateParams,
    });
  }
}

module.exports = new DoctorPayoutRepository();
