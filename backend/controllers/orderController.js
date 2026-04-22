const Order = require('../models/Order');
const OwnerNotification = require('../models/OwnerNotification');
const Tenant = require('../models/Tenant');
const { sendOrderNotification } = require('../services/emailService');
const { emitOwnerNotification } = require('../services/socketService');

const createOrder = async (req, res) => {
  try {
    const { tenantId, customerName, phone, email, address, notes, items } = req.body;
    const tenant = await Tenant.findById(tenantId).lean();

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant.businessType !== 'restaurant') {
      return res.status(400).json({ error: 'Ordering is available only for restaurant websites' });
    }

    const menuItems = tenant.content?.products || [];
    const normalizedItems = (Array.isArray(items) ? items : [])
      .map(item => {
        const title = typeof item?.title === 'string' ? item.title.trim() : '';
        const quantity = Number(item?.quantity);
        const matchedMenuItem = menuItems.find(menuItem => menuItem.title === title);

        if (!title || !Number.isFinite(quantity) || quantity < 1 || !matchedMenuItem) {
          return null;
        }

        return {
          title: matchedMenuItem.title,
          price: Number(matchedMenuItem.price) || 0,
          quantity,
          category: matchedMenuItem.category || ''
        };
      })
      .filter(Boolean);

    if (!normalizedItems.length) {
      return res.status(400).json({ error: 'Please choose at least one valid menu item' });
    }

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      tenantId,
      customerName,
      phone,
      email,
      address,
      notes,
      items: normalizedItems,
      totalAmount
    });

    await order.save();

    let ownerNotificationCreated = false;
    try {
      const itemCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
      const ownerNotification = await OwnerNotification.create({
        tenantId,
        type: 'order_created',
        title: 'New restaurant order',
        message: `${customerName} placed an order for ${itemCount} item${itemCount === 1 ? '' : 's'}.`,
        payload: {
          orderId: order._id,
          customerName,
          phone,
          email: email || '',
          address: address || '',
          notes: notes || '',
          items: normalizedItems,
          totalAmount
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
