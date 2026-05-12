const router = require('express').Router();
const DoctorPayoutController = require('./doctorPayout.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT));

router.get('/', DoctorPayoutController.list);
router.post('/', DoctorPayoutController.create);
router.patch('/:id/pay', DoctorPayoutController.markPaid);

module.exports = router;
