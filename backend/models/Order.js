const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, min: 0, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    category: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, default: '' },
  items: {
    type: [OrderItemSchema],
    validate: {
      validator: items => Array.isArray(items) && items.length > 0,
      message: 'At least one item is required'
    }
  },
  totalAmount: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
