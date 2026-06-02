const prisma = require('../../config/database');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');

function mapSubSpeciality(item) {
  return {
    id: item.id,
    specialityId: item.specialityId,
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    descriptionAr: item.descriptionAr ?? null,
    descriptionEn: item.descriptionEn ?? null,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
  };
}

function parseSpecialityIds(query) {
  const ids = [];
  if (query.specializationId) ids.push(parseInt(query.specializationId, 10));
  if (query.specialityId) ids.push(parseInt(query.specialityId, 10));
  if (query.specializationIds) {
    query.specializationIds.split(',').forEach((s) => {
      const n = parseInt(s.trim(), 10);
      if (!Number.isNaN(n)) ids.push(n);
    });
  }
  if (query.specialityIds) {
    query.specialityIds.split(',').forEach((s) => {
      const n = parseInt(s.trim(), 10);
      if (!Number.isNaN(n)) ids.push(n);
    });
  }
  return [...new Set(ids.filter((id) => id > 0))];
}

class SubSpecialityService {
  static async listBySpecialityIds(query, options = {}) {
    const specialityIds = parseSpecialityIds(query);
    const { page, limit, skip } = buildPagination(query);
    const where = { isActive: options.includeInactive ? undefined : true };
    if (specialityIds.length) where.specialityId = { in: specialityIds };

    const [data, total] = await Promise.all([
      prisma.subSpeciality.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ specialityId: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.subSpeciality.count({ where }),
    ]);
    return { data: data.map(mapSubSpeciality), total, page, limit };
  }

  static async listForSpeciality(specialityId, query = {}) {
    return this.listBySpecialityIds({ specializationId: specialityId, ...query });
  }

  static async listForAdmin(specialityId, query = {}) {
    const parent = await prisma.speciality.findUnique({ where: { id: parseInt(specialityId, 10) } });
    if (!parent) throw new NotFoundError('Speciality not found');
    const { page, limit, skip } = buildPagination(query);
    const where = { specialityId: parent.id };
    const [data, total] = await Promise.all([
      prisma.subSpeciality.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.subSpeciality.count({ where }),
    ]);
    return { data: data.map(mapSubSpeciality), total, page, limit };
  }

  static async getByIdForAdmin(specialityId, id) {
    const item = await prisma.subSpeciality.findFirst({
      where: { id: parseInt(id, 10), specialityId: parseInt(specialityId, 10) },
    });
    if (!item) throw new NotFoundError('Sub-speciality not found');
    return mapSubSpeciality(item);
  }

  static async createForAdmin(specialityId, data) {
    const parent = await prisma.speciality.findUnique({ where: { id: parseInt(specialityId, 10) } });
    if (!parent) throw new NotFoundError('Speciality not found');
    const created = await prisma.subSpeciality.create({
      data: {
        specialityId: parent.id,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return mapSubSpeciality(created);
  }

  static async updateForAdmin(specialityId, id, data) {
    await this.getByIdForAdmin(specialityId, id);
    const updated = await prisma.subSpeciality.update({
      where: { id: parseInt(id, 10) },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    return mapSubSpeciality(updated);
  }

  static async deleteForAdmin(specialityId, id) {
    await this.getByIdForAdmin(specialityId, id);
    await prisma.subSpeciality.delete({ where: { id: parseInt(id, 10) } });
    return { id: parseInt(id, 10) };
  }

  static async validateForDoctorRegistration(specialityId, subSpecializationIds) {
    if (!subSpecializationIds?.length) return [];
    if (!specialityId) {
      throw new BadRequestError('specializationId is required when subSpecializationIds are provided');
    }
    const parentId = parseInt(specialityId, 10);
    const uniqueIds = [...new Set(subSpecializationIds.map((id) => parseInt(id, 10)))];
    const subs = await prisma.subSpeciality.findMany({
      where: { id: { in: uniqueIds }, specialityId: parentId, isActive: true },
    });
    if (subs.length !== uniqueIds.length) {
      throw new BadRequestError('One or more sub-specialization IDs are invalid for the selected specialization');
    }
    return uniqueIds;
  }

  static async connectToDoctor(doctorProfileId, subSpecializationIds) {
    if (!subSpecializationIds?.length) return;
    await prisma.doctorProfile.update({
      where: { id: doctorProfileId },
      data: {
        subSpecialities: { connect: subSpecializationIds.map((id) => ({ id })) },
      },
    });
  }
}

module.exports = SubSpecialityService;
