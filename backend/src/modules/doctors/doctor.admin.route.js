const router = require('express').Router();
const { authenticate } = require('../../middlewares/auth');
const { guard, MEDICAL, SUPER } = require('../admin/admin.permissions');
const DoctorAdminController = require('./doctor.admin.controller');

router.use(authenticate);

router.get('/', guard('doctors.list', ...MEDICAL), DoctorAdminController.list);
router.get('/:id', guard('doctors.read', ...MEDICAL), DoctorAdminController.getOne);
router.put('/:id', guard('doctors.update', ...MEDICAL), DoctorAdminController.update);
router.delete('/:id', guard('doctors.delete', ...SUPER), DoctorAdminController.delete);
router.patch('/:id/approve', guard('doctors.verify', ...MEDICAL), DoctorAdminController.approve);
router.patch('/:id/reject', guard('doctors.verify', ...MEDICAL), DoctorAdminController.reject);
router.patch('/:id/status', guard('doctors.update', ...MEDICAL), DoctorAdminController.updateStatus);

module.exports = router;
