const router = require('express').Router();
const InsuranceCaseController = require('./insuranceCase.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.post('/', authorize(ROLES.PATIENT, ROLES.SUPPORT_STAFF, ROLES.INSURANCE_STAFF, ROLES.SUPER_ADMIN), InsuranceCaseController.create);
router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_STAFF, ROLES.SUPPORT_STAFF), InsuranceCaseController.list);
router.get('/:id', InsuranceCaseController.getById);
router.patch('/:id/approve', authorize(ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF), InsuranceCaseController.approve);
router.patch('/:id/reject', authorize(ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF), InsuranceCaseController.reject);
router.patch('/:id/request-info', authorize(ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF), InsuranceCaseController.requestInfo);
router.patch('/:id/escalate', authorize(ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF, ROLES.INSURANCE_STAFF), InsuranceCaseController.escalate);
router.post('/:id/notes', InsuranceCaseController.addNote);

module.exports = router;
