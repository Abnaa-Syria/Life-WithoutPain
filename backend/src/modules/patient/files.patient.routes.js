const router = require('express').Router();
const PatientService = require('../patients/patient.service');
const { uploadSingle } = require('../../middlewares/upload');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getMedicalFiles(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.post('/', uploadSingle('file'), asyncHandler(async (req, res) => {
  const fileData = {
    fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
    title: req.body.title || req.file?.originalname || req.body.fileName || 'Medical file',
    category: req.body.category || 'OTHER',
    mimeType: req.file?.mimetype || req.body.mimeType,
  };
  const data = await PatientService.uploadMedicalFile(req.user.id, fileData);
  return createdResponse(res, { data });
}));

module.exports = router;
