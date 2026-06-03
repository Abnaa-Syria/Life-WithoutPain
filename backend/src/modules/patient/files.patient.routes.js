const router = require('express').Router();
const PatientService = require('../patients/patient.service');
const { uploadSingle } = require('../../middlewares/upload');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { BadRequestError } = require('../../shared/errors/AppError');

const FILE_CATEGORIES = new Set([
  'LAB_RESULT', 'RADIOLOGY', 'PRESCRIPTION', 'MEDICAL_REPORT', 'INSURANCE_DOCUMENT', 'ID_DOCUMENT', 'OTHER',
]);

router.get('/', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getMedicalFiles(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.post('/', uploadSingle('file'), asyncHandler(async (req, res) => {
  const category = (req.body.category || 'OTHER').toUpperCase();
  if (!FILE_CATEGORIES.has(category)) {
    throw new BadRequestError(`category must be one of: ${[...FILE_CATEGORIES].join(', ')}`);
  }
  const fileData = {
    fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
    title: req.body.title || req.file?.originalname || req.body.fileName || 'Medical file',
    category,
    mimeType: req.file?.mimetype || req.body.mimeType,
  };
  const data = await PatientService.uploadMedicalFile(req.user.id, fileData);
  return createdResponse(res, { data });
}));

module.exports = router;
