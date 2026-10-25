'use strict';

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { audioUpload, coverUpload } = require('../config/cloudinary');
const {
  listTracks, getTrack, uploadTrack,
  deleteTrack, likeTrack, getLyrics,
} = require('../controllers/trackController');

// Upload middleware: expect fields named "audio" and "cover"
const uploadFields = [
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
];

// Use a combined multer with per-field storage switching via a middleware wrapper
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

const mixedStorage = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => {
      if (file.fieldname === 'audio') {
        return {
          resource_type: 'video',
          folder: 'sonic-pulse/audio',
          allowed_formats: ['mp3', 'wav', 'flac', 'ogg', 'm4a'],
        };
      }
      return {
        resource_type: 'image',
        folder: 'sonic-pulse/covers',
        transformation: [{ width: 600, height: 600, crop: 'fill', quality: 'auto:good' }],
      };
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024, files: 2 },
});

router.get('/', protect, listTracks);
router.get('/:id', protect, getTrack);
router.post('/', protect, (req, res, next) => {
  mixedStorage.fields(uploadFields)(req, res, (err) => {
    if (err) {
      // Выводим точную ошибку мультера/Cloudinary в терминал бэкенда
      console.error('MULTER / CLOUDINARY ERROR:', err);

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File is too large. Maximum size is 100 MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected file field. Use audio and cover only.' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }

    try {
      return uploadTrack(req, res, next);
    } catch (error) {
      return next(error);
    }
  });
});
router.delete('/:id', protect, deleteTrack);
router.post('/:id/like', protect, likeTrack);
router.get('/:id/lyrics', protect, getLyrics);

module.exports = router;