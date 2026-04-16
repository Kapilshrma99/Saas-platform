const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const { getRedisClient } = require('../config/redis');

const sanitizeTenant = (tenant, { publicView = false } = {}) => {
  if (!tenant) return tenant;
  const copy = JSON.parse(JSON.stringify(tenant));
  if (copy.owner) {
    delete copy.owner.password;
    if (publicView) {
      delete copy.owner;
    }
  }
  if (publicView) {
    delete copy.subscription;
  }
  return copy;
};

const normalizeWebsiteFields = payload => {
  const nextPayload = { ...payload };
  if (typeof nextPayload.slug === 'string') {
    nextPayload.slug = nextPayload.slug.toLowerCase().trim();
  }
  if (typeof nextPayload.subdomain === 'string') {
    nextPayload.subdomain = nextPayload.subdomain.toLowerCase().trim();
  }
  if (typeof nextPayload.name === 'string') {
    nextPayload.name = nextPayload.name.trim();
  }
  if (typeof nextPayload.businessType === 'string') {
    nextPayload.businessType = nextPayload.businessType.trim();
  }
  return nextPayload;
};

const validateWebsitePayload = payload => {
  if (!payload.name) return 'Business name is required';
  if (!payload.slug) return 'Slug is required';
  if (!payload.subdomain) return 'Subdomain is required';
  if (!payload.businessType) return 'Business type is required';
  return null;
};

const ensureUniqueWebsiteFields = async (payload, tenantId = null) => {
  const conflicts = [];

  if (payload.slug) {
    const slugOwner = await Tenant.findOne({ slug: payload.slug }).select('_id').lean();
    if (slugOwner && slugOwner._id.toString() !== tenantId) {
      conflicts.push('Slug is already in use');
    }
  }

  if (payload.subdomain) {
    const subdomainOwner = await Tenant.findOne({ subdomain: payload.subdomain }).select('_id').lean();
    if (subdomainOwner && subdomainOwner._id.toString() !== tenantId) {
      conflicts.push('Subdomain is already in use');
    }
  }

  return conflicts[0] || null;
};

const createTenant = async (req, res) => {
  try {
    const payload = normalizeWebsiteFields(req.body);
    const validationError = validateWebsitePayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const uniqueError = await ensureUniqueWebsiteFields(payload);
    if (uniqueError) {
      return res.status(400).json({ error: uniqueError });
    }

    if (payload.owner?.password) {
      payload.owner.password = await bcrypt.hash(payload.owner.password, 10);
    }

    const tenant = new Tenant({ ...payload, websiteCreated: true });
    await tenant.save();
    const redis = getRedisClient();
    if (redis && tenant.slug) await redis.del(`tenant:${tenant.slug}`);
    res.status(201).json(sanitizeTenant(tenant.toObject()));
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getTenantBySlug = async (req, res) => {
  try {
    const identifier = req.params.slug?.toLowerCase();
    console.log('Fetching tenant by identifier:', identifier);
    const tenant = await Tenant.findOne({
      websiteCreated: true,
      $or: [{ slug: identifier }, { subdomain: identifier }]
    }).lean();
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(sanitizeTenant(tenant, { publicView: true }));
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
    const update = normalizeWebsiteFields(req.body);

    const mergedWebsiteState = {
      name: update.name ?? existingTenant.name,
      slug: update.slug ?? existingTenant.slug,
      subdomain: update.subdomain ?? existingTenant.subdomain,
      businessType: update.businessType ?? existingTenant.businessType
    };

    const validationError = validateWebsitePayload(mergedWebsiteState);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const uniqueError = await ensureUniqueWebsiteFields(mergedWebsiteState, tenantId);
    if (uniqueError) {
      return res.status(400).json({ error: uniqueError });
    }

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

    update.websiteCreated = true;

    const tenant = await Tenant.findByIdAndUpdate(tenantId, update, {
      new: true,
      runValidators: true
    }).lean();
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    const redis = getRedisClient();
    if (redis) {
      if (existingTenant.slug) await redis.del(`tenant:${existingTenant.slug}`);
      if (tenant.slug) await redis.del(`tenant:${tenant.slug}`);
      if (existingTenant.subdomain) await redis.del(`tenant:${existingTenant.subdomain}`);
      if (tenant.subdomain) await redis.del(`tenant:${tenant.subdomain}`);
    }
    res.json(sanitizeTenant(tenant));
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createTenant, getTenantBySlug, updateTenant };
