const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { ADMIN_ROLES } = require('../../constants');
const DoctorAdminController = require('./doctor.admin.controller');

router.use(authenticate);
router.use(authorize(...ADMIN_ROLES));

// DOCTORS Admin Routes
router.get('/', DoctorAdminController.list);
router.get('/:id', DoctorAdminController.getOne);
router.put('/:id', DoctorAdminController.update);
router.delete('/:id', DoctorAdminController.delete);
router.patch('/:id/approve', DoctorAdminController.approve);
router.patch('/:id/reject', DoctorAdminController.reject);
router.patch('/:id/status', DoctorAdminController.updateStatus);

module.exports = router;
