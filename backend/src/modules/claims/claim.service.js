const ClaimBatchRepository = require('./claimBatch.repository');
const ClaimItemRepository = require('./claimItem.repository');
const { buildPagination } = require('../../utils/pagination');
const { enrichInsuranceProvidersOnRecords } = require('../../i18n/enrichRelations');

class ClaimService {
  static async createBatch(data) {
    return ClaimBatchRepository.create({ data });
  }

  static async listBatches(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.providerId) where.providerId = parseInt(query.providerId);

    const [data, total] = await Promise.all([
      ClaimBatchRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { provider: true, _count: { select: { items: true } } },
      }),
      ClaimBatchRepository.count({ where }),
    ]);
    return { data: await enrichInsuranceProvidersOnRecords(data), total, page, limit };
  }

  static async getBatchById(id) {
    const batch = await ClaimBatchRepository.findUnique({
      where: { id: parseInt(id) },
      include: { provider: true, items: { include: { appointment: true } } },
    });
    return enrichInsuranceProvidersOnRecords(batch);
  }

  static async submitBatch(id) {
    return ClaimBatchRepository.update({
      where: { id: parseInt(id) },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
  }

  static async listItems(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.claimBatchId) where.claimBatchId = parseInt(query.claimBatchId);
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      ClaimItemRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      ClaimItemRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }
}

module.exports = ClaimService;
