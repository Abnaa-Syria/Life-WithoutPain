const router = require('express').Router();
const ClaimController = require('./claim.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT));

router.post('/batches', ClaimController.createBatch);
router.get('/batches', ClaimController.listBatches);
router.get('/batches/:id', ClaimController.getBatchById);
router.patch('/batches/:id/submit', ClaimController.submitBatch);
router.get('/items', ClaimController.listItems);

module.exports = router;
