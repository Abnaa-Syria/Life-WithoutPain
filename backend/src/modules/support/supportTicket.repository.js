const BaseRepository = require('../../shared/repositories/BaseRepository');

class SupportTicketRepository extends BaseRepository {
  constructor() {
    super('supportCase');
  }
}

module.exports = new SupportTicketRepository();
