const ReconciliationRepository = require('./reconciliation.repository');
const { buildPagination } = require('../../utils/pagination');
const { enrichInsuranceProvidersOnRecords } = require('../../i18n/enrichRelations');

class ReconciliationService {
  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.providerId) where.providerId = parseInt(query.providerId);

    const [data, total] = await Promise.all([
      ReconciliationRepository.findMany({
        where, skip, take: limit, orderBy: { recordedAt: 'desc' },
        include: { provider: true },
      }),
      ReconciliationRepository.count({ where }),
    ]);
    return { data: await enrichInsuranceProvidersOnRecords(data), total, page, limit };
  }

  static async create(data) {
    return ReconciliationRepository.create({ data });
  }

  static async getById(id) {
    const row = await ReconciliationRepository.findUnique({
      where: { id: parseInt(id) },
      include: { provider: true, claimBatch: true },
    });
    return enrichInsuranceProvidersOnRecords(row);
  }
}

module.exports = ReconciliationService;
