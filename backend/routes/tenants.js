const express = require('express');
const router = express.Router();
const { createTenant, getTenantBySlug, updateTenant } = require('../controllers/tenantController');

router.post('/', createTenant);
router.get('/:slug', getTenantBySlug);
router.put('/:id', updateTenant);

module.exports = router;
