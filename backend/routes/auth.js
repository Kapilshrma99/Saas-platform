const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { registerTenant, loginTenant, getTenantMe, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', registerTenant);
router.post('/login', loginTenant);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getTenantMe);

module.exports = router;
