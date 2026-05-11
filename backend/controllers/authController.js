const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');
const { getJwtSecret } = require('../utils/auth');
const { sendPasswordResetEmail } = require('../services/emailService');

const sanitizeTenant = tenant => {
  if (!tenant) return tenant;
  const copy = JSON.parse(JSON.stringify(tenant));
  if (copy.owner) {
    delete copy.owner.password;
    delete copy.owner.passwordResetToken;
    delete copy.owner.passwordResetExpires;
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
    delete tenant.slug;
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

const getFrontendAppUrl = req => {
  const configuredUrl =
    process.env.FRONTEND_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  const origin = req.get('origin');
  if (origin) {
    return origin.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase();
    const tenant = await Tenant.findOne({ 'owner.email': normalizedEmail });

    if (!tenant) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    tenant.owner.passwordResetToken = hashedToken;
    tenant.owner.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await tenant.save();

    const resetUrl = `${getFrontendAppUrl(req)}/auth?mode=reset&token=${encodeURIComponent(rawToken)}`;
    const businessName = tenant.name || tenant.content?.title || 'your website';
    const result = await sendPasswordResetEmail({
      recipient: tenant.owner.email,
      businessName,
      resetUrl
    });

    if (!result.sent) {
      tenant.owner.passwordResetToken = undefined;
      tenant.owner.passwordResetExpires = undefined;
      await tenant.save();
      return res.status(503).json({ error: 'Password reset email service is unavailable.' });
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tenant = await Tenant.findOne({
      'owner.passwordResetToken': hashedToken,
      'owner.passwordResetExpires': { $gt: new Date() }
    });

    if (!tenant) {
      return res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
    }

    tenant.owner.password = await bcrypt.hash(password, 10);
    tenant.owner.passwordResetToken = undefined;
    tenant.owner.passwordResetExpires = undefined;
    await tenant.save();

    const authToken = createToken(tenant);
    res.json({
      message: 'Password reset successful.',
      tenant: sanitizeTenant(tenant.toObject()),
      token: authToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerTenant, loginTenant, getTenantMe, forgotPassword, resetPassword };
