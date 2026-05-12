const ReconciliationRepository = require('./reconciliation.repository');
const { buildPagination } = require('../../utils/pagination');

class ReconciliationService {
  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.providerId) where.providerId = parseInt(query.providerId);

    const [data, total] = await Promise.all([
      ReconciliationRepository.findMany({
        where, skip, take: limit, orderBy: { recordedAt: 'desc' },
        include: { provider: { select: { nameAr: true, nameEn: true } } },
      }),
      ReconciliationRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async create(data) {
    return ReconciliationRepository.create({ data });
  }

  static async getById(id) {
    return ReconciliationRepository.findUnique({
      where: { id: parseInt(id) },
      include: { provider: true, claimBatch: true },
    });
  }
}

module.exports = ReconciliationService;
