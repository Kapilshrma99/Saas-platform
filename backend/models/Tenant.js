const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  subdomain: { type: String, required: true, unique: true, lowercase: true },
  businessType: { type: String, required: true },
  owner: {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  content: {
    title: { type: String, default: 'My Business' },
    description: { type: String, default: 'Describe your services here.' },
    services: [{ title: String, description: String }],
    products: [{ title: String, description: String, price: Number }],
    images: [{ url: String, alt: String }],
    contactInfo: {
      phone: String,
      email: String,
      address: String
    }
  },
  theme: {
    primaryColor: { type: String, default: '#2f80ed' },
    secondaryColor: { type: String, default: '#f2c94c' },
    fontFamily: { type: String, default: 'Inter, sans-serif' },
    layout: { type: String, default: 'modern' }
  },
  subscription: {
    plan: { type: String, default: 'basic' },
    status: { type: String, default: 'inactive' },
    razorpayCustomerId: String,
    razorpaySubscriptionId: String,
    currentPeriodEnd: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', TenantSchema);
