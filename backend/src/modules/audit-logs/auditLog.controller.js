const AuditLogService = require('./auditLog.service');
const { paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class AuditLogController {
  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await AuditLogService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });
}

module.exports = AuditLogController;
