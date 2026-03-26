const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — we stream directly to Cloudinary
const memoryStorage = multer.memoryStorage();

const uploadMedia = multer({
  storage: memoryStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image or video files are allowed'), false);
    }
  },
});

const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// Upload a buffer to Cloudinary via stream
const streamUpload = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
};

// Middleware that uploads req.file buffer to Cloudinary and attaches result
const cloudinaryUpload = async (req, res, next) => {
  if (!req.file) return next();

  const isVideo = req.file.mimetype.startsWith('video/');
  try {
    const result = await streamUpload(req.file.buffer, {
      folder: `lifted-to-lift/${isVideo ? 'videos' : 'images'}`,
      resource_type: isVideo ? 'video' : 'image',
      transformation: isVideo ? undefined : [{ quality: 'auto', fetch_format: 'auto' }],
    });

    // Attach to req.file so routes can use req.file.path and req.file.filename
    req.file.path = result.secure_url;
    req.file.filename = result.public_id;
    req.file.cloudinaryResult = result;
    next();
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Media upload failed: ' + err.message });
  }
};

module.exports = { uploadImage, uploadMedia, cloudinaryUpload, cloudinary };
