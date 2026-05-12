const InsuranceProviderRepository = require('./insuranceProvider.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');

class InsuranceProviderService {
  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.search) where.OR = [{ nameAr: { contains: query.search } }, { nameEn: { contains: query.search } }];
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [data, total] = await Promise.all([
      InsuranceProviderRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      InsuranceProviderRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await InsuranceProviderRepository.findUnique({ where: { id: parseInt(id) } });
    if (!data) throw new NotFoundError('Insurance provider not found');
    return data;
  }

  static async create(data) {
    return InsuranceProviderRepository.create({ data });
  }

  static async update(id, data) {
    return InsuranceProviderRepository.update({ where: { id: parseInt(id) }, data });
  }

  static async delete(id) {
    return InsuranceProviderRepository.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = InsuranceProviderService;
