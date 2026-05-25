const router = require('express').Router();
const InsuranceCaseController = require('./insuranceCase.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { requirePermissionOrLegacy } = require('../../middlewares/requirePermission');
const { ROLES } = require('../../constants');

const decide = requirePermissionOrLegacy('insurance.cases.decide', ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF);

router.use(authenticate);

router.post('/', authorize(ROLES.PATIENT, ROLES.SUPPORT_STAFF, ROLES.INSURANCE_STAFF, ROLES.SUPER_ADMIN), InsuranceCaseController.create);
router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_STAFF, ROLES.SUPPORT_STAFF), InsuranceCaseController.list);
router.get('/:id', InsuranceCaseController.getById);
router.patch('/:id/approve', decide, InsuranceCaseController.approve);
router.patch('/:id/reject', decide, InsuranceCaseController.reject);
router.patch('/:id/approval', decide, InsuranceCaseController.updateApproval);
router.patch('/:id/request-info', decide, InsuranceCaseController.requestInfo);
router.patch('/:id/escalate', requirePermissionOrLegacy('insurance.cases.update', ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF, ROLES.INSURANCE_STAFF), InsuranceCaseController.escalate);
router.post('/:id/notes', InsuranceCaseController.addNote);

module.exports = router;
