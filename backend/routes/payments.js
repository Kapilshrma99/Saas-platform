const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  createSubscriptionHandler,
  handleWebhook,
  verifySubscription
} = require('../controllers/paymentController');

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/create-subscription', createSubscriptionHandler);
router.post('/verify-subscription', verifySubscription);
router.post('/webhook', handleWebhook);

module.exports = router;
