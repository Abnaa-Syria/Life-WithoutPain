const { ForbiddenError, UnauthorizedError } = require('../shared/errors/AppError');
const { hasPermission: checkPerm } = require('../modules/rbac/permission.service');

function getUserPermissions(req) {
  return req.user?.permissions ?? [];
}

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (!checkPerm(getUserPermissions(req), permission)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};

const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    const userPerms = getUserPermissions(req);
    if (!permissions.some((p) => checkPerm(userPerms, p))) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};

const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    const userPerms = getUserPermissions(req);
    if (!permissions.every((p) => checkPerm(userPerms, p))) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};

/**
 * Migration helper: pass if user has DB permission OR legacy enum role.
 */
const requirePermissionOrLegacy = (permission, ...legacyRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (checkPerm(getUserPermissions(req), permission)) {
      return next();
    }
    if (legacyRoles.length && legacyRoles.includes(req.user.role)) {
      return next();
    }
    return next(new ForbiddenError('You do not have permission to perform this action'));
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requirePermissionOrLegacy,
};
