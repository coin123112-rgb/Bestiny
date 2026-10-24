'use strict';

const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true, maxlength: 200 },
    artist:   { type: String, required: true, trim: true, maxlength: 200 },
    album:    { type: String, default: '',    trim: true, maxlength: 200 },
    genre:    { type: String, default: 'Other' },
    duration: { type: Number, default: 0 },   // seconds

    // Cloudinary
    audioPublicId: { type: String, required: true },
    audioUrl:      { type: String, required: true },  // public streaming URL
    coverPublicId: { type: String, default: null },
    coverUrl:      { type: String, default: null },

    // Lyrics (plain text or LRC format)
    lyricsRaw:  { type: String, default: '' },

    // Stats
    plays:      { type: Number, default: 0 },
    likes:      { type: Number, default: 0 },

    // Ownership
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Visibility
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Full-text search index
trackSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

module.exports = mongoose.model('Track', trackSchema);
