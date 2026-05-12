const BaseRepository = require('../../shared/repositories/BaseRepository');

class PaymentRepository extends BaseRepository {
  constructor() {
    super('payment');
  }
}
module.exports = new PaymentRepository();
