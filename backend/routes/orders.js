const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/:tenantId', authMiddleware, getOrders);

module.exports = router;
