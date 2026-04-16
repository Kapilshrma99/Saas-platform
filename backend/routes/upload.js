const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, upload.single('file'), uploadImage);

module.exports = router;
