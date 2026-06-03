const { randomUUID } = require('crypto');
const prisma = require('../../config/database');
const { ROLES, ADMIN_ROLES } = require('../../constants');
const { BadRequestError, NotFoundError } = require('../../shared/errors/AppError');
const NotificationService = require('../../shared/notifications/NotificationService');
const { buildPagination } = require('../../utils/pagination');

const AUDIENCE_PATIENT = 'PATIENT';
const AUDIENCE_DOCTOR = 'DOCTOR';
const AUDIENCE_STAFF = 'STAFF';

async function resolveRecipientUserIds({ userId, targetAudience }) {
  if (userId) {
    const user = await prisma.user.findFirst({
      where: { id: parseInt(userId, 10), deletedAt: null },
      select: { id: true },
    });
    if (!user) throw new NotFoundError('User not found');
    return { userIds: [user.id], audience: `USER:${user.id}` };
  }

  if (!targetAudience) {
    throw new BadRequestError('Provide userId or targetAudience');
  }

  if (targetAudience === AUDIENCE_PATIENT) {
    const users = await prisma.user.findMany({
      where: { role: ROLES.PATIENT, deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });
    return { userIds: users.map((u) => u.id), audience: AUDIENCE_PATIENT };
  }

  if (targetAudience === AUDIENCE_DOCTOR) {
    const users = await prisma.user.findMany({
      where: { role: ROLES.DOCTOR, deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });
    return { userIds: users.map((u) => u.id), audience: AUDIENCE_DOCTOR };
  }

  if (targetAudience === AUDIENCE_STAFF) {
    const users = await prisma.user.findMany({
      where: { role: { in: ADMIN_ROLES }, deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });
    return { userIds: users.map((u) => u.id), audience: AUDIENCE_STAFF };
  }

  if (targetAudience.startsWith('ROLE:')) {
    const role = targetAudience.slice(5);
    if (!Object.values(ROLES).includes(role)) {
      throw new BadRequestError('Invalid role in targetAudience');
    }
    const users = await prisma.user.findMany({
      where: { role, deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });
    return { userIds: users.map((u) => u.id), audience: targetAudience };
  }

  throw new BadRequestError('Invalid targetAudience');
}

class NotificationsAdminService {
  static async listManual(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = { source: 'ADMIN_MANUAL' };

    const rows = await prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
        createdByAdmin: { select: { id: true, fullName: true } },
      },
    });

    const total = await prisma.notification.count({ where });
    return { data: rows, total, page, limit };
  }

  static async getManual(id) {
    const notification = await prisma.notification.findFirst({
      where: { id: parseInt(id, 10), source: 'ADMIN_MANUAL' },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
        createdByAdmin: { select: { id: true, fullName: true } },
      },
    });
    if (!notification) throw new NotFoundError('Manual notification not found');
    return notification;
  }

  static async sendManual(adminId, body) {
    const {
      titleAr,
      titleEn,
      bodyAr,
      bodyEn,
      type = 'SYSTEM',
      userId,
      targetAudience,
    } = body;

    if (!titleAr || !titleEn || !bodyAr || !bodyEn) {
      throw new BadRequestError('Bilingual title and body are required');
    }

    const { userIds, audience } = await resolveRecipientUserIds({ userId, targetAudience });
    if (!userIds.length) {
      throw new BadRequestError('No recipients found for the selected audience');
    }

    const batchId = randomUUID();
    const payloads = userIds.map((uid) => ({
      userId: uid,
      titleAr,
      titleEn,
      bodyAr,
      bodyEn,
      type,
      source: 'ADMIN_MANUAL',
      targetAudience: audience,
      createdByAdminId: adminId,
      batchId,
    }));

    const result = await NotificationService.createBulk(payloads);
    return { batchId, count: result?.count ?? 0, targetAudience: audience };
  }

  static async resendManual(adminId, id) {
    const original = await this.getManual(id);
    const where = original.batchId
      ? { batchId: original.batchId, source: 'ADMIN_MANUAL' }
      : { id: original.id };

    const siblings = await prisma.notification.findMany({ where });
    const batchId = randomUUID();
    const payloads = siblings.map((n) => ({
      userId: n.userId,
      titleAr: n.titleAr,
      titleEn: n.titleEn,
      bodyAr: n.bodyAr,
      bodyEn: n.bodyEn,
      type: n.type,
      source: 'ADMIN_MANUAL',
      targetAudience: n.targetAudience,
      createdByAdminId: adminId,
      batchId,
    }));

    const result = await NotificationService.createBulk(payloads);
    return { batchId, count: result?.count ?? 0 };
  }

  static async deleteManual(id) {
    const notification = await this.getManual(id);
    if (notification.batchId) {
      await prisma.notification.deleteMany({
        where: { batchId: notification.batchId, source: 'ADMIN_MANUAL' },
      });
      return { deleted: true };
    }
    await prisma.notification.delete({ where: { id: notification.id } });
    return { deleted: true };
  }

  static async searchUsers(query) {
    const q = (query.q || query.search || '').trim();
    const { page, limit, skip } = buildPagination({ ...query, limit: query.limit || 20 });
    const where = { deletedAt: null, status: 'ACTIVE' };
    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }
    if (query.role) where.role = query.role;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
        select: { id: true, fullName: true, email: true, phone: true, role: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}

module.exports = NotificationsAdminService;
