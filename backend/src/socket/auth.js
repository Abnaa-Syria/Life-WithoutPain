const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');

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

  return user;
}

module.exports = { authenticateSocketToken };
