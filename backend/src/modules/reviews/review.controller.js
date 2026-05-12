const ReviewService = require('./review.service');
const { createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class ReviewController {
  static create = asyncHandler(async (req, res) => {
    const data = await ReviewService.create(req.user.id, req.body);
    return createdResponse(res, { data });
  });

  static listByDoctor = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await ReviewService.listByDoctor(req.params.doctorId, req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });
}

module.exports = ReviewController;
