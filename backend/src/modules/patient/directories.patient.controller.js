const PatientService = require('../patients/patient.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapDirectoryPrescription, mapDirectoryReport } = require('../../shared/utils/patientAppMappers');

const list = asyncHandler(async (req, res) => {
  const result = await PatientService.listDirectories(req.user.id, req.query);
  return successResponse(res, {
    data: {
      prescriptions: result.prescriptions.map(mapDirectoryPrescription),
      reports: result.reports.map(mapDirectoryReport),
      xrays: result.xrays,
    },
  });
});

module.exports = { list };
