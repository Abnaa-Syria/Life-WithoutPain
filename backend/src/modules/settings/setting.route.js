const router = require('express').Router();
const SettingController = require('./setting.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.get('/', SettingController.list);
router.get('/privacy-policy', SettingController.getPrivacyPolicy);
router.get('/terms-conditions', SettingController.getTermsConditions);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN), SettingController.create);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), SettingController.update);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), SettingController.delete);

module.exports = router;
