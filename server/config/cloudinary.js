'use strict';

const cloudinary  = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ── Storage for audio files ────────────────────────────────────────────────
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: 'video', // Cloudinary uses "video" for audio
    folder: 'sonic-pulse/audio',
    allowed_formats: ['mp3', 'wav', 'flac', 'ogg', 'm4a'],
    transformation: [{ quality: 'auto' }],
  },
});

// ── Storage for cover images ───────────────────────────────────────────────
const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: 'image',
    folder: 'sonic-pulse/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'fill', quality: 'auto:good' }],
  },
});

const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

const coverUpload = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Generate a signed URL for a Cloudinary resource
 * Expires in 1 hour by default.
 */
function signedUrl(publicId, resourceType = 'video', expiresIn = 3600) {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    sign_url: true,
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    secure: true,
  });
}

module.exports = { cloudinary, audioUpload, coverUpload, signedUrl };
