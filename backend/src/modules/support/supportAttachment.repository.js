const BaseRepository = require('../../shared/repositories/BaseRepository');

class SupportAttachmentRepository extends BaseRepository {
  constructor() {
    super('supportAttachment');
  }
}

module.exports = new SupportAttachmentRepository();
