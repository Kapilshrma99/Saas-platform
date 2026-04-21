const OwnerNotification = require('../models/OwnerNotification');

const serializeNotification = notification => {
  if (!notification) return notification;

  return {
    _id: notification._id,
    tenantId: notification.tenantId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    payload: notification.payload || {},
    readAt: notification.readAt,
    createdAt: notification.createdAt
  };
};

const listNotifications = async (req, res) => {
  try {
    const notifications = await OwnerNotification.find({ tenantId: req.tenant._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      notifications: notifications.map(serializeNotification)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await OwnerNotification.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant._id },
      { readAt: new Date() },
      { new: true }
    ).lean();

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification: serializeNotification(notification) });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { listNotifications, markNotificationRead };
