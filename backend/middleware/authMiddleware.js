const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
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