const prisma = require('../config/database');
const logger = require('../config/logger');

const createAuditLog = async ({ actorId, entityType, entityId, action, oldValues, newValues, req }) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        entityType,
        entityId,
        action,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
        ipAddress: req?.ip || null,
        userAgent: req?.get('user-agent') || null,
      },
    });
  } catch (error) {
    logger.error({ msg: 'Failed to create audit log', error: error.message });
  }
};

const auditMiddleware = (entityType, action) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const entityId = req.params.id ? parseInt(req.params.id) : body?.data?.id;
        createAuditLog({
          actorId: req.user.id,
          entityType,
          entityId,
          action,
          oldValues: req._auditOldValues || null,
          newValues: req.body || null,
          req,
        });
      }
      return originalJson(body);
    };
    next();
  };
};

module.exports = { createAuditLog, auditMiddleware };
