'use strict';

const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    coverUrl:    { type: String, default: null },
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tracks:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    isPublic:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
