const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const tenantRoutes = require('./routes/tenants');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');
const { connectRedis } = require('./config/redis');
const { connectDB } = require('./config/db');
const { initSocketServer } = require('./services/socketService');

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDB();
connectRedis();
app.use(tenantMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

initSocketServer(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
