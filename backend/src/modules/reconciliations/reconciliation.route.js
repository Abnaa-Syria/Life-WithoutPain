const router = require('express').Router();
const ReconciliationController = require('./reconciliation.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT));

router.get('/', ReconciliationController.list);
router.post('/', ReconciliationController.create);
router.get('/:id', ReconciliationController.getById);

module.exports = router;
