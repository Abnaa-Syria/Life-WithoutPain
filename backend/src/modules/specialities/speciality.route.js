const router = require('express').Router();
const SpecialityController = require('./speciality.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

// Public routes
router.get('/', SpecialityController.list);
router.get('/:id', SpecialityController.getById);

// Protected routes
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN), SpecialityController.create);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN), SpecialityController.update);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), SpecialityController.delete);

module.exports = router;
