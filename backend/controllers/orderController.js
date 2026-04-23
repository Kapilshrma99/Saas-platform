const crypto = require('crypto');
const Order = require('../models/Order');
const OwnerNotification = require('../models/OwnerNotification');
const Tenant = require('../models/Tenant');
const { sendOrderNotification } = require('../services/emailService');
const { emitOwnerNotification } = require('../services/socketService');

const createOrder = async (req, res) => {
  try {
    const {
      tenantId,
      customerName,
      phone,
      email,
      address,
      notes,
      items,
      paymentMethod,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;
    const tenant = await Tenant.findById(tenantId).lean();

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (!['restaurant', 'shopping'].includes(tenant.businessType)) {
      return res.status(400).json({ error: 'Ordering is available only for restaurant and shopping websites' });
    }

    const catalogItems = tenant.content?.products || [];
    const normalizedItems = (Array.isArray(items) ? items : [])
      .map(item => {
        const title = typeof item?.title === 'string' ? item.title.trim() : '';
        const quantity = Number(item?.quantity);
        const matchedCatalogItem = catalogItems.find(catalogItem => catalogItem.title === title);

        if (!title || !Number.isFinite(quantity) || quantity < 1 || !matchedCatalogItem) {
          return null;
        }

        return {
          title: matchedCatalogItem.title,
          price: Number(matchedCatalogItem.price) || 0,
          quantity,
          category: matchedCatalogItem.category || ''
        };
      })
      .filter(Boolean);

    if (!normalizedItems.length) {
      return res.status(400).json({ error: 'Please choose at least one valid product' });
    }

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const normalizedPaymentMethod = paymentMethod === 'online' ? 'online' : 'cod';
    let paymentStatus = normalizedPaymentMethod === 'online' ? 'paid' : 'pending';

    if (normalizedPaymentMethod === 'online') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing Razorpay payment details' });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return res.status(500).json({ error: 'Missing Razorpay configuration' });
      }

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed' });
      }
    }

    const order = new Order({
      tenantId,
      customerName,
      phone,
      email,
      address,
      notes,
      items: normalizedItems,
      totalAmount,
      currency: 'INR',
      paymentMethod: normalizedPaymentMethod,
      paymentStatus,
      razorpayOrderId: normalizedPaymentMethod === 'online' ? razorpay_order_id : '',
      razorpayPaymentId: normalizedPaymentMethod === 'online' ? razorpay_payment_id : ''
    });

    await order.save();

    let ownerNotificationCreated = false;
    try {
      const itemCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
      const ownerNotification = await OwnerNotification.create({
        tenantId,
        type: 'order_created',
        title: 'New order received',
        message: `${customerName} placed ${normalizedPaymentMethod === 'online' ? 'a paid' : 'an'} order for ${itemCount} item${itemCount === 1 ? '' : 's'}.`,
        payload: {
          orderId: order._id,
          customerName,
          phone,
          email: email || '',
          address: address || '',
          notes: notes || '',
          items: normalizedItems,
          totalAmount,
          paymentMethod: normalizedPaymentMethod,
          paymentStatus
        }
      });

      emitOwnerNotification(tenantId, {
        _id: ownerNotification._id,
        tenantId,
        type: ownerNotification.type,
        title: ownerNotification.title,
        message: ownerNotification.message,
        payload: ownerNotification.payload,
        readAt: ownerNotification.readAt,
        createdAt: ownerNotification.createdAt
      });
      ownerNotificationCreated = true;
    } catch (ownerNotificationError) {
      console.error('Order saved but realtime notification failed:', ownerNotificationError);
    }

    let notificationSent = false;
    try {
      const notification = await sendOrderNotification({ tenant, order });
      notificationSent = notification.sent;
    } catch (notificationError) {
      console.error('Order saved but email notification failed:', notificationError);
    }

    res.status(201).json({ order, notificationSent, ownerNotificationCreated });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    if (!req.tenant || req.tenant._id.toString() !== req.params.tenantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const orders = await Order.find({ tenantId: req.params.tenantId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder, getOrders };
