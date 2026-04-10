const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async ({ amount, currency = 'INR', receipt }) => {
  return razorpay.orders.create({ amount, currency, receipt, payment_capture: 1 });
};

const createSubscription = async ({ planId, customerId }) => {
  return razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 12,
    customer_id: customerId
  });
};

const fetchSubscription = async subscriptionId => razorpay.subscriptions.fetch(subscriptionId);

module.exports = { createOrder, createSubscription, fetchSubscription, razorpay };
