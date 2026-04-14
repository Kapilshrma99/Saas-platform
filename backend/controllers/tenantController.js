const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const { getRedisClient } = require('../config/redis');

const sanitizeTenant = tenant => {
  if (!tenant) return tenant;
  const copy = JSON.parse(JSON.stringify(tenant));
  if (copy.owner) {
    delete copy.owner.password;
  }
  return copy;
};

const createTenant = async (req, res) => {
  try {
    const payload = req.body;
    payload.slug = payload.slug.toLowerCase();
    payload.subdomain = payload.subdomain.toLowerCase();

    if (payload.owner?.password) {
      payload.owner.password = await bcrypt.hash(payload.owner.password, 10);
    }

    const tenant = new Tenant(payload);
    await tenant.save();
    const redis = getRedisClient();
    if (redis) await redis.del(`tenant:${tenant.slug}`);
    res.status(201).json(sanitizeTenant(tenant.toObject()));
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
    res.json(sanitizeTenant(tenant));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;
    if (!req.tenant || req.tenant._id.toString() !== tenantId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const existingTenant = req.tenant;
    const update = { ...req.body };

    update.slug = update.slug?.toLowerCase();
    update.subdomain = update.subdomain?.toLowerCase();

    if (update.owner) {
      const nextOwner = {
        email: update.owner.email?.toLowerCase() || existingTenant.owner.email,
        password: existingTenant.owner.password
      };

      if (update.owner.password) {
        nextOwner.password = await bcrypt.hash(update.owner.password, 10);
      }

      update.owner = nextOwner;
    }

    const tenant = await Tenant.findByIdAndUpdate(tenantId, update, { new: true }).lean();
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    const redis = getRedisClient();
    if (redis) await redis.del(`tenant:${tenant.slug}`);
    res.json(sanitizeTenant(tenant));
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createTenant, getTenantBySlug, updateTenant };
