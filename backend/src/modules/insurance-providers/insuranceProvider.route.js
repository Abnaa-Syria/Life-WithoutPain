const router = require('express').Router();
const InsuranceProviderController = require('./insuranceProvider.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.get('/', InsuranceProviderController.list);
router.get('/:id', InsuranceProviderController.getById);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN), InsuranceProviderController.create);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), InsuranceProviderController.update);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), InsuranceProviderController.delete);

module.exports = router;
