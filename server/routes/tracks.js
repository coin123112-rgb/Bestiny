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
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.get('/',           protect, listTracks);
router.get('/:id',        protect, getTrack);
router.post('/',          protect, mixedStorage.fields(uploadFields), uploadTrack);
router.delete('/:id',     protect, deleteTrack);
router.post('/:id/like',  protect, likeTrack);
router.get('/:id/lyrics', protect, getLyrics);

module.exports = router;
