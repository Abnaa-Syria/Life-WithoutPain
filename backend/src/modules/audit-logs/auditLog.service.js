const AuditLogRepository = require('./auditLog.repository');
const { buildPagination } = require('../../utils/pagination');

class AuditLogService {
  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.action) where.action = query.action;
    if (query.actorId) where.actorId = parseInt(query.actorId);
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      AuditLogRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { actor: { select: { fullName: true, email: true, role: true } } },
      }),
      AuditLogRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }
}

module.exports = AuditLogService;
