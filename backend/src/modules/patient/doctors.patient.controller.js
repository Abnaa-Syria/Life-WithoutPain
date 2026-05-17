const DoctorService = require('../doctors/doctor.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const search = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await DoctorService.search(req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const data = await DoctorService.getPublicDetail(req.params.id);
  return successResponse(res, {
    data: {
      ...data,
      certificates: (data.verificationDocuments || []).map((d) => ({
        id: d.id,
        fileUrl: d.fileUrl,
        fileType: d.fileType,
      })),
      address: data.clinicAddress || data.workplace || data.city,
    },
  });
});

module.exports = { search, getById };
