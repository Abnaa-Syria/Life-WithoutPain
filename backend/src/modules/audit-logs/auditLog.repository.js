const BaseRepository = require('../../shared/repositories/BaseRepository');

class AuditLogRepository extends BaseRepository {
  constructor() {
    super('auditLog');
  }
}
module.exports = new AuditLogRepository();
