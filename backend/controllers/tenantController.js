const Tenant = require('../models/Tenant');
const { getRedisClient } = require('../config/redis');

const createTenant = async (req, res) => {
  try {
    const payload = req.body;
    payload.slug = payload.slug.toLowerCase();
    payload.subdomain = payload.subdomain.toLowerCase();
    const tenant = new Tenant(payload);
    await tenant.save();
    const redis = getRedisClient();
    if (redis) await redis.del(`tenant:${tenant.slug}`);
    res.status(201).json(tenant);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getTenantBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const tenant = await Tenant.findOne({ slug }).lean();
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const update = req.body;
    const tenant = await Tenant.findByIdAndUpdate(tenantId, update, { new: true }).lean();
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    const redis = getRedisClient();
    if (redis) await redis.del(`tenant:${tenant.slug}`);
    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createTenant, getTenantBySlug, updateTenant };
