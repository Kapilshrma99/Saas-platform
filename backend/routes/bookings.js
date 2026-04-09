const express = require('express');
const router = express.Router();
const { createBooking, getBookings } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/:tenantId', getBookings);

module.exports = router;
