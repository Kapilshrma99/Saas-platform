const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { registerTenant, loginTenant, getTenantMe } = require('../controllers/authController');

router.post('/register', registerTenant);
router.post('/login', loginTenant);
router.get('/me', authMiddleware, getTenantMe);

module.exports = router;