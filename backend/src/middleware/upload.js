const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lifted-to-lift/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lifted-to-lift/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
  },
});

const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: `lifted-to-lift/${isVideo ? 'videos' : 'images'}`,
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi', 'webm']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto' }],
    };
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'), false);
  },
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only image or video files are allowed'), false);
  },
});

module.exports = { uploadImage, uploadVideo, uploadMedia, cloudinary };
