const { Server } = require('socket.io');
const Tenant = require('../models/Tenant');
const { verifyAuthToken } = require('../utils/auth');

let io;

const getTenantRoom = tenantId => `tenant:${tenantId}`;

const initSocketServer = server => {
  io = new Server(server, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAuthToken(token);
      const tenant = await Tenant.findById(decoded.id).lean();

      if (!tenant) {
        return next(new Error('Tenant not found'));
      }

      socket.tenant = { id: tenant._id.toString(), email: tenant.owner?.email };
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', socket => {
    socket.join(getTenantRoom(socket.tenant.id));

    socket.emit('socket:ready', {
      tenantId: socket.tenant.id,
      connectedAt: new Date().toISOString()
    });
  });

  return io;
};

const emitOwnerNotification = (tenantId, notification) => {
  if (!io) return;
  io.to(getTenantRoom(String(tenantId))).emit('notification:new', notification);
};

module.exports = { initSocketServer, emitOwnerNotification, getTenantRoom };
