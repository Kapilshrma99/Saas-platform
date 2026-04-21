const Tenant = require('../models/Tenant');
const { verifyAuthToken } = require('../utils/auth');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = verifyAuthToken(token);
    const tenant = await Tenant.findById(decoded.id);
    if (!tenant) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
