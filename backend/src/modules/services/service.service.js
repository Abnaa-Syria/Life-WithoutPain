const ServiceRepository = require('./service.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');

class ServiceService {
  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.search) where.OR = [{ nameAr: { contains: query.search } }, { nameEn: { contains: query.search } }];
    if (query.type) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [data, total] = await Promise.all([
      ServiceRepository.findMany({ where, skip, take: limit, orderBy: { sortOrder: 'asc' } }),
      ServiceRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await ServiceRepository.findUnique({ where: { id: parseInt(id) } });
    if (!data) throw new NotFoundError('Service not found');
    return data;
  }

  static async create(data) {
    return ServiceRepository.create({ data });
  }

  static async update(id, data) {
    return ServiceRepository.update({ where: { id: parseInt(id) }, data });
  }

  static async delete(id) {
    return ServiceRepository.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = ServiceService;
