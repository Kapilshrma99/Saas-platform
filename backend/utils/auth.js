const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'secret';

const verifyAuthToken = token => jwt.verify(token, getJwtSecret());

module.exports = { getJwtSecret, verifyAuthToken };
