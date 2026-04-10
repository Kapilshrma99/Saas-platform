const Booking = require('../models/Booking');
const Tenant = require('../models/Tenant');

const createBooking = async (req, res) => {
  try {
    const { tenantId, name, phone, datetime, message } = req.body;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    const booking = new Booking({ tenantId, name, phone, datetime, message });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const bookings = await Booking.find({ tenantId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createBooking, getBookings };
