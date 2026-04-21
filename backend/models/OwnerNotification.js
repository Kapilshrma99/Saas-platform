const mongoose = require('mongoose');

const OwnerNotificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  type: { type: String, required: true, default: 'booking_created' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OwnerNotification', OwnerNotificationSchema);
