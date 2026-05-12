const router = require('express').Router();
const PaymentController = require('./payment.controller');
const { authenticate } = require('../../middlewares/auth');

router.post('/initiate', authenticate, PaymentController.initiate);
router.post('/webhook', PaymentController.webhook);
router.get('/', authenticate, PaymentController.list);
router.get('/:id', authenticate, PaymentController.getById);

module.exports = router;
