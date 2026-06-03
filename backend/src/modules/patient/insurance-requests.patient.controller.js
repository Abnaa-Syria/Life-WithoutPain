const InsuranceCaseService = require('../insurance-cases/insuranceCase.service');
const { resolvePatientProfile } = require('../../shared/utils/patientAppContext');
const { mapInsuranceCase } = require('../../shared/utils/patientAppMappers');
const { paginatedResponse, successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class InsuranceRequestsPatientController {
  static list = asyncHandler(async (req, res) => {
    const { patientId } = await resolvePatientProfile(req.user.id);
    const { data, total, page, limit } = await InsuranceCaseService.listForPatient(patientId, req.query);
    return paginatedResponse(res, {
      data: data.map(mapInsuranceCase),
      total,
      page,
      limit,
    });
  });

  static getById = asyncHandler(async (req, res) => {
    const { patientId } = await resolvePatientProfile(req.user.id);
    const row = await InsuranceCaseService.getById(req.params.id);
    if (row.patientId !== patientId) {
      const { NotFoundError } = require('../../shared/errors/AppError');
      throw new NotFoundError('INSURANCE_REQUEST_NOT_FOUND');
    }
    return successResponse(res, { data: mapInsuranceCase(row, { detailed: true }) });
  });
}

module.exports = InsuranceRequestsPatientController;
