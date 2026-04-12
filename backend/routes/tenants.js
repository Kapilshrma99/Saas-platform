const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createTenant, getTenantBySlug, updateTenant } = require('../controllers/tenantController');

router.post('/', createTenant);
router.get('/:slug', getTenantBySlug);
router.put('/:id', authMiddleware, updateTenant);

module.exports = router;
