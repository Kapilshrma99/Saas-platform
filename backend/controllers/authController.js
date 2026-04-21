const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');
const { getJwtSecret } = require('../utils/auth');

const sanitizeTenant = tenant => {
  if (!tenant) return tenant;
  const copy = JSON.parse(JSON.stringify(tenant));
  if (copy.owner) {
    delete copy.owner.password;
  }
  return copy;
};

const createToken = tenant => {
  return jwt.sign(
    { id: tenant._id, email: tenant.owner.email },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

const registerTenant = async (req, res) => {
  try {
    const { owner } = req.body;
    if (!owner?.email || !owner?.password) {
      return res.status(400).json({ error: 'Owner email and password are required' });
    }

    const normalizedEmail = owner.email.toLowerCase();
    const existing = await Tenant.findOne({ 'owner.email': normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'Owner email already registered' });
    }

    const tenant = new Tenant({
      owner: {
        email: normalizedEmail,
        password: await bcrypt.hash(owner.password, 10)
      },
      websiteCreated: false
    });
    await tenant.save();

    const token = createToken(tenant);
    res.status(201).json({ tenant: sanitizeTenant(tenant.toObject()), token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const tenant = await Tenant.findOne({ 'owner.email': email.toLowerCase() });
    if (!tenant) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, tenant.owner.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = createToken(tenant);
    res.json({ tenant: sanitizeTenant(tenant.toObject()), token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getTenantMe = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({ tenant: sanitizeTenant(tenant.toObject()) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerTenant, loginTenant, getTenantMe };
