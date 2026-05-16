const CallSessionService = require('./callSession.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const startSession = asyncHandler(async (req, res) => {
  const data = await CallSessionService.startSessionForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data });
});

module.exports = { startSession };
