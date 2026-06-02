const SpecialityRepository = require('./speciality.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { mapSpecializationWithSubs } = require('../../shared/utils/patientAppMappers');

const SPECIALITY_INCLUDE_SUBS = {
  subSpecialities: {
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  },
};

class SpecialityService {
  static async list(query, options = {}) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.search) {
      where.OR = [
        { nameAr: { contains: query.search } },
        { nameEn: { contains: query.search } }
      ];
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    else if (options.activeOnly) where.isActive = true;

    const [data, total] = await Promise.all([
      SpecialityRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: options.includeSubs ? SPECIALITY_INCLUDE_SUBS : undefined,
      }),
      SpecialityRepository.count({ where }),
    ]);

    const mapped = options.includeSubs ? data.map(mapSpecializationWithSubs) : data;
    return { data: mapped, total, page, limit };
  }

  static async getById(id, options = {}) {
    const data = await SpecialityRepository.findUnique({
      where: { id: parseInt(id) },
      include: options.includeSubs ? SPECIALITY_INCLUDE_SUBS : undefined,
    });
    if (!data) throw new NotFoundError('Speciality not found');
    return options.includeSubs ? mapSpecializationWithSubs(data) : data;
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
