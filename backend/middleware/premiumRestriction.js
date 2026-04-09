module.exports = (req, res, next) => {
  const tenant = req.tenant;
  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }
  if (tenant.subscription?.status !== 'active') {
    return res.status(403).json({ message: 'Premium features require active subscription' });
  }
  next();
};
