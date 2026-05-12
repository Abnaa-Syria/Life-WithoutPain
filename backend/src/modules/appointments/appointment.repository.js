const BaseRepository = require('../../shared/repositories/BaseRepository');

class AppointmentRepository extends BaseRepository {
  constructor() {
    super('appointment');
  }

  async countByDoctor(doctorId, where = {}) {
    return this.model.count({
      where: { ...where, doctorId },
    });
  }

  async findManyByDoctor(doctorId, params = {}) {
    const { skip, take, where, include } = params;
    return this.model.findMany({
      skip,
      take,
      where: { ...where, doctorId },
      include,
      orderBy: { appointmentDate: 'desc' },
    });
  }
}

module.exports = new AppointmentRepository();
