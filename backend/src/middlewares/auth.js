const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const { UnauthorizedError, ForbiddenError } = require('../shared/errors/AppError');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
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
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Account is not active');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return next(error);
    }
    return next(new UnauthorizedError('Invalid or expired token'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
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
      },
    });

    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
