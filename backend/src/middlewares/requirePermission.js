const { ForbiddenError, UnauthorizedError } = require('../shared/errors/AppError');
const { hasPermission: checkPerm } = require('../modules/rbac/permission.service');

function getUserPermissions(req) {
  return req.user?.permissions ?? [];
}

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('AUTHENTICATION_REQUIRED'));
    }
    if (!checkPerm(getUserPermissions(req), permission)) {
      return next(new ForbiddenError('PERMISSION_ACTION_DENIED'));
    }
    next();
  };
};

const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('AUTHENTICATION_REQUIRED'));
    }
    const userPerms = getUserPermissions(req);
    if (!permissions.some((p) => checkPerm(userPerms, p))) {
      return next(new ForbiddenError('PERMISSION_ACTION_DENIED'));
    }
    next();
  };
};

const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('AUTHENTICATION_REQUIRED'));
    }
    const userPerms = getUserPermissions(req);
    if (!permissions.every((p) => checkPerm(userPerms, p))) {
      return next(new ForbiddenError('PERMISSION_ACTION_DENIED'));
    }
    next();
  };
};

const requirePermissionOrLegacy = (permission, ...legacyRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('AUTHENTICATION_REQUIRED'));
    }
    if (checkPerm(getUserPermissions(req), permission)) {
      return next();
    }
    if (legacyRoles.length && legacyRoles.includes(req.user.role)) {
      return next();
    }
    return next(new ForbiddenError('PERMISSION_ACTION_DENIED'));
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requirePermissionOrLegacy,
};
