const SettingService = require('./setting.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class SettingController {
  static list = asyncHandler(async (req, res) => {
    const isAdmin = !!req.headers.authorization;
    const data = await SettingService.list(isAdmin);
    return successResponse(res, { data });
  });

  static getPrivacyPolicy = asyncHandler(async (req, res) => {
    const data = await SettingService.getByKey('PRIVACY_POLICY');
    return successResponse(res, { data });
  });

  static getTermsConditions = asyncHandler(async (req, res) => {
    const data = await SettingService.getByKey('TERMS_CONDITIONS');
    return successResponse(res, { data });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await SettingService.create(req.body);
    return createdResponse(res, { data });
  });

  static update = asyncHandler(async (req, res) => {
    const data = await SettingService.update(req.params.id, req.body);
    return successResponse(res, { data });
  });

  static delete = asyncHandler(async (req, res) => {
    await SettingService.delete(req.params.id);
    return successResponse(res, { data: null, message: 'Setting deleted' });
  });
}

module.exports = SettingController;
