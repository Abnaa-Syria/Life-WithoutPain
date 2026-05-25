const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const { getEffectivePermissions } = require('../modules/rbac/permission.service');

async function authenticateSocketToken(token) {
  if (!token) {
    throw new Error('Access token is required');
  }

  const decoded = jwt.verify(token, config.jwt.accessSecret);
  const user = await prisma.user.findFirst({
    where: { id: decoded.userId, deletedAt: null },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      preferredLanguage: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('Account is not active');
  }

  const permissions = await getEffectivePermissions(user.id, user.role);
  return { ...user, permissions };
}

module.exports = { authenticateSocketToken };
