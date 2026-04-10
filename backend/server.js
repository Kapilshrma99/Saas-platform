const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const tenantRoutes = require('./routes/tenants');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/upload');
const { connectRedis } = require('./config/redis');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDB();
connectRedis();
app.use(tenantMiddleware);

app.use('/api/tenants', tenantRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
