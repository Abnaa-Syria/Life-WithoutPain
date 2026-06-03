const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const { UnauthorizedError, ForbiddenError } = require('../shared/errors/AppError');
const { getEffectivePermissions } = require('../modules/rbac/permission.service');
const { bindLocaleMiddleware } = require('./locale');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('ACCESS_TOKEN_REQUIRED');
    }

    const token = authHeader.split(' ')[1];
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
      throw new UnauthorizedError('USER_NOT_FOUND');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('ACCOUNT_NOT_ACTIVE');
    }

    const permissions = await getEffectivePermissions(user.id, user.role);
    req.user = { ...user, permissions };
    bindLocaleMiddleware(req, res, next);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return next(error);
    }
    return next(new UnauthorizedError('INVALID_TOKEN'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('AUTHENTICATION_REQUIRED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('PERMISSION_DENIED'));
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
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

    if (user && user.status === 'ACTIVE') {
      const permissions = await getEffectivePermissions(user.id, user.role);
      req.user = { ...user, permissions };
      bindLocaleMiddleware(req, res, () => {});
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
