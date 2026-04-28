const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  subdomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  businessType: { type: String, trim: true },
  owner: {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  websiteCreated: { type: Boolean, default: false },
  content: {
    title: { type: String, default: 'My Business' },
    description: { type: String, default: 'Describe your services here.' },
    heroImage: {
      url: String,
      alt: String
    },
    heroCarousel: {
      direction: { type: String, default: 'side' },
      speed: { type: Number, default: 4 },
      images: [{ url: String, alt: String }]
    },
    services: [
      {
        title: String,
        description: String,
        image: {
          url: String,
          alt: String
        }
      }
    ],
    products: [
      {
        title: String,
        description: String,
        price: Number,
        category: String,
        image: {
          url: String,
          alt: String
        }
      }
    ],
    reviews: [
      {
        name: String,
        role: String,
        quote: String,
        rating: { type: Number, default: 5 }
      }
    ],
    blogsEnabled: { type: Boolean, default: false },
    blogPosts: [
      {
        id: String,
        title: String,
        excerpt: String,
        content: String,
        date: String,
        author: String,
        image: {
          url: String,
          alt: String
        }
      }
    ],
    images: [{ url: String, alt: String }],
    contactInfo: {
      phone: String,
      email: String,
      address: String
    },
    customSections: [
      {
        id: String,
        page: { type: String, default: 'home' },
        placement: { type: String, default: 'bottom' },
        title: String,
        description: String,
        layout: { type: String, default: 'single' },
        blocks: [
          {
            id: String,
            type: String,
            column: { type: Number, default: 1 },
            align: { type: String, default: 'left' },
            content: String,
            image: {
              url: String,
              alt: String
            },
            video: {
              url: String,
              title: String
            }
          }
        ]
      }
    ]
  },
  theme: {
    primaryColor: { type: String, default: '#2f80ed' },
    secondaryColor: { type: String, default: '#f2c94c' },
    fontFamily: { type: String, default: 'Inter, sans-serif' },
    layout: { type: String, default: 'modern' },
    siteWidth: { type: Number, default: 1600 },
    heroTitleSize: { type: Number, default: 72 },
    sectionRadius: { type: Number, default: 36 },
    cardRadius: { type: Number, default: 28 }
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
