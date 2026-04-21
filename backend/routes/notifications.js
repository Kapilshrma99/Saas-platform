const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { listNotifications, markNotificationRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authMiddleware, listNotifications);
router.patch('/:id/read', authMiddleware, markNotificationRead);

module.exports = router;
