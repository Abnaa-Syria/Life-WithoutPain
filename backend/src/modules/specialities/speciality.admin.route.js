const router = require('express').Router();
const SpecialityController = require('./speciality.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ADMIN_ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(...ADMIN_ROLES));

// SPECIALITIES Admin Routes
router.get('/', SpecialityController.list);
router.get('/:id', SpecialityController.getById);
router.post('/', SpecialityController.create);
router.put('/:id', SpecialityController.update);
router.delete('/:id', SpecialityController.delete);

module.exports = router;
