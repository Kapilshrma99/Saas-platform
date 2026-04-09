const { minioClient, ensureBucket } = require('../config/minio');

const uploadImage = async (req, res) => {
  try {
    await ensureBucket();
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Image is required' });
    const slug = req.body.slug || 'public';
    const objectName = `uploads/${slug}/${Date.now()}-${file.originalname}`;
    await minioClient.putObject('uploads', objectName, file.buffer);
    const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/uploads/${objectName}`;
    res.json({ url, objectName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadImage };
