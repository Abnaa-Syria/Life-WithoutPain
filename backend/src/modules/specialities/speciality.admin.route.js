const router = require('express').Router();
const SpecialityController = require('./speciality.controller');
const { authenticate } = require('../../middlewares/auth');
const { guard, MEDICAL, SUPER } = require('../admin/admin.permissions');

router.use(authenticate);
router.use((req, _res, next) => {
  req.catalogAdmin = true;
  next();
});

router.get('/', guard('specialities.list', ...MEDICAL), SpecialityController.list);
router.use('/:specialityId/sub-specialities', require('./subSpeciality.admin.routes'));
router.get('/:id', guard('specialities.read', ...MEDICAL), SpecialityController.getById);
router.post('/', guard('specialities.create', ...MEDICAL), SpecialityController.create);
router.put('/:id', guard('specialities.update', ...MEDICAL), SpecialityController.update);
router.delete('/:id', guard('specialities.delete', ...SUPER), SpecialityController.delete);

module.exports = router;
