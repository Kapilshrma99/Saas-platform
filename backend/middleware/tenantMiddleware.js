const Tenant = require('../models/Tenant');
const { getRedisClient } = require('../config/redis');

const tenantMiddleware = async (req, res, next) => {
  try {
    const host = req.headers.host || '';
    const hostParts = host.split(':')[0].split('.');
    let subdomain = null;

    if (hostParts.length > 2) {
      subdomain = hostParts[0];
    }

    let slug = req.params.slug || null;
    if (!slug && req.path.startsWith('/site/')) {
      const parts = req.path.split('/');
      slug = parts[2];
    }

    const redis = getRedisClient();
    let tenant = null;

    if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
      const cacheKey = `tenant:${subdomain}`;
      const cached = redis ? await redis.get(cacheKey) : null;
      if (cached) {
        tenant = JSON.parse(cached);
      } else {
        tenant = await Tenant.findOne({ subdomain }).lean();
        if (tenant && redis) await redis.set(cacheKey, JSON.stringify(tenant), { EX: 60 * 5 });
      }
    }

    if (!tenant && slug) {
      const cacheKey = `tenant:${slug}`;
      const cached = redis ? await redis.get(cacheKey) : null;
      if (cached) {
        tenant = JSON.parse(cached);
      } else {
        tenant = await Tenant.findOne({ slug }).lean();
        if (tenant && redis) await redis.set(cacheKey, JSON.stringify(tenant), { EX: 60 * 5 });
      }
    }

    req.tenant = tenant || null;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = tenantMiddleware;
