const DoctorPayoutRepository = require('./doctorPayout.repository');
const { buildPagination } = require('../../utils/pagination');

class DoctorPayoutService {
  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.doctorId) where.doctorId = parseInt(query.doctorId);

    const [data, total] = await Promise.all([
      DoctorPayoutRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { doctor: { include: { user: { select: { fullName: true } } } } },
      }),
      DoctorPayoutRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async create(data) {
    return DoctorPayoutRepository.create({ data });
  }

  static async markPaid(id) {
    return DoctorPayoutRepository.update({
      where: { id: parseInt(id) },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }
}

module.exports = DoctorPayoutService;
