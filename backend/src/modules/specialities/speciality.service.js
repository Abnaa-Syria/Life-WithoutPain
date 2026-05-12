const SpecialityRepository = require('./speciality.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');

class SpecialityService {
  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.search) {
      where.OR = [
        { nameAr: { contains: query.search } },
        { nameEn: { contains: query.search } }
      ];
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [data, total] = await Promise.all([
      SpecialityRepository.findMany({ where, skip, take: limit, orderBy: { sortOrder: 'asc' } }),
      SpecialityRepository.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await SpecialityRepository.findUnique({ where: { id: parseInt(id) } });
    if (!data) throw new NotFoundError('Speciality not found');
    return data;
  }

  static async create(data) {
    return SpecialityRepository.create({ data });
  }

  static async update(id, data) {
    return SpecialityRepository.update({ where: { id: parseInt(id) }, data });
  }

  static async delete(id) {
    return SpecialityRepository.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = SpecialityService;
