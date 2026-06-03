const HomeServiceService = require('../home-services/home-service.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapHomeServiceRequestListItem, mapHomeServiceRequestDetail } = require('../../shared/utils/patientAppMappers');

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await HomeServiceService.listForPatient(req.user.id, req.query);
  return paginatedResponse(res, {
    data: data.map(mapHomeServiceRequestListItem),
    total,
    page,
    limit,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await HomeServiceService.getByIdForPatient(req.user.id, req.params.id);
  return successResponse(res, { data: mapHomeServiceRequestDetail(data) });
});

const create = asyncHandler(async (req, res) => {
  const data = await HomeServiceService.createForPatient(req.user.id, req.body);
  return createdResponse(res, { data: mapHomeServiceRequestDetail(data), messageKey: 'HOME_SERVICE_SUBMITTED' });
});

const cancel = asyncHandler(async (req, res) => {
  const data = await HomeServiceService.cancelForPatient(req.user.id, req.params.id, req.body);
  return successResponse(res, { data: mapHomeServiceRequestDetail(data), messageKey: 'HOME_SERVICE_CANCELLED' });
});

module.exports = { list, getById, create, cancel };
