const BaseRepository = require('../../shared/repositories/BaseRepository');

class ReviewRepository extends BaseRepository {
  constructor() {
    super('review');
  }

  async aggregateForDoctor(doctorId, aggregateParams) {
    return this.model.aggregate({
      where: { doctorId },
      ...aggregateParams,
    });
  }
}

module.exports = new ReviewRepository();
