const Booking = require('../models/Booking');
const OwnerNotification = require('../models/OwnerNotification');
const Tenant = require('../models/Tenant');
const { sendBookingNotification } = require('../services/emailService');
const { emitOwnerNotification } = require('../services/socketService');

const createBooking = async (req, res) => {
  try {
    const { tenantId, name, phone, datetime, message } = req.body;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const booking = new Booking({ tenantId, name, phone, datetime, message });
    await booking.save();

    let ownerNotificationCreated = false;
    try {
      const ownerNotification = await OwnerNotification.create({
        tenantId,
        type: 'booking_created',
        title: 'New appointment request',
        message: `${name} requested an appointment.`,
        payload: {
          bookingId: booking._id,
          name,
          phone,
          datetime: booking.datetime,
          message: message || ''
        }
      });

      emitOwnerNotification(tenantId, {
        _id: ownerNotification._id,
        tenantId,
        type: ownerNotification.type,
        title: ownerNotification.title,
        message: ownerNotification.message,
        payload: ownerNotification.payload,
        readAt: ownerNotification.readAt,
        createdAt: ownerNotification.createdAt
      });
      ownerNotificationCreated = true;
    } catch (ownerNotificationError) {
      console.error('Booking saved but realtime notification failed:', ownerNotificationError);
    }

    let notificationSent = false;
    try {
      const notification = await sendBookingNotification({ tenant, booking });
      notificationSent = notification.sent;
    } catch (notificationError) {
      console.error('Booking saved but notification failed:', notificationError);
    }

    res.status(201).json({ booking, notificationSent, ownerNotificationCreated });
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
