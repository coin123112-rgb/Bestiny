'use strict';

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  listPlaylists, getPlaylist, createPlaylist,
  addTrack, removeTrack, deletePlaylist,
} = require('../controllers/playlistController');

router.get('/',                         protect, listPlaylists);
router.post('/',                        protect, createPlaylist);
router.get('/:id',                      protect, getPlaylist);
router.delete('/:id',                   protect, deletePlaylist);
router.post('/:id/tracks',              protect, addTrack);
router.delete('/:id/tracks/:trackId',   protect, removeTrack);

module.exports = router;
