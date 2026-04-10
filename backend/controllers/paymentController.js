const Tenant = require('../models/Tenant');
const { createOrder, createSubscription, fetchSubscription, razorpay } = require('../services/razorpayService');

const PLAN_MAP = {
  basic: { price: 9900, razorpayPlanId: process.env.RAZORPAY_BASIC_PLAN_ID || '' },
  pro: { price: 39900, razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || '' },
  premium: { price: 69900, razorpayPlanId: process.env.RAZORPAY_PREMIUM_PLAN_ID || '' }
};

const createPaymentOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const order = await createOrder({ amount, receipt });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tenantSlug } = req.body;
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    const tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    tenant.subscription.status = 'active';
    tenant.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await tenant.save();
    res.json({ success: true, tenant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createSubscriptionHandler = async (req, res) => {
  try {
    const { tenantId, plan } = req.body;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    const planConfig = PLAN_MAP[plan];
    if (!planConfig?.razorpayPlanId) {
      return res.status(400).json({ message: 'Missing Razorpay plan configuration' });
    }
    const subscription = await createSubscription({ planId: planConfig.razorpayPlanId, customerId: tenant.subscription.razorpayCustomerId });
    tenant.subscription.plan = plan;
    tenant.subscription.razorpaySubscriptionId = subscription.id;
    tenant.subscription.status = 'active';
    tenant.subscription.currentPeriodEnd = new Date(subscription.current_end * 1000);
    await tenant.save();
    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    if (event.event === 'subscription.activated' || event.event === 'payment.captured') {
      const subscriptionId = event.payload.subscription?.entity?.id;
      if (subscriptionId) {
        const tenant = await Tenant.findOne({ 'subscription.razorpaySubscriptionId': subscriptionId });
        if (tenant) {
          tenant.subscription.status = 'active';
          tenant.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await tenant.save();
        }
      }
    }
    if (event.event === 'subscription.cancelled') {
      const subscriptionId = event.payload.subscription?.entity?.id;
      const tenant = await Tenant.findOne({ 'subscription.razorpaySubscriptionId': subscriptionId });
      if (tenant) {
        tenant.subscription.status = 'inactive';
        await tenant.save();
      }
    }
    res.json({ received: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const verifySubscription = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    const crypto = require('crypto');
    const message = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(message).digest('hex');
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Signature verification failed' });
    }
    res.json({ success: true, message: 'Subscription verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPaymentOrder, verifyPayment, createSubscriptionHandler, handleWebhook, verifySubscription };
