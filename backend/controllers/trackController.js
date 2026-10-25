'use strict';

const Track    = require('../models/Track');
const User     = require('../models/User');
const { cloudinary, signedUrl } = require('../config/cloudinary');
const { parseLrc } = require('../utils/parseLrc');

// GET /api/tracks
async function listTracks(req, res, next) {
  try {
    const {
      sort = 'createdAt', limit = 20, page = 1,
      liked, myUploads, genre,
    } = req.query;

    const filter = { isPublic: true };

    if (liked === 'true') {
      filter._id = { $in: req.user.likedTracks ?? [] };
    }
    if (myUploads === 'true') {
      filter.uploadedBy = req.user._id;
    }
    if (genre) {
      filter.genre = genre;
    }

    const sortMap = {
      plays:     { plays: -1 },
      createdAt: { createdAt: -1 },
      random:    { _id: 1 },        // simple approximation
    };

    const tracks = await Track.find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Attach liked flag per user
    const likedSet = new Set(
      (req.user.likedTracks ?? []).map(id => id.toString())
    );
    const result = tracks.map(t => ({
      ...t,
      liked: likedSet.has(t._id.toString()),
    }));

    res.json({ tracks: result, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
}

// GET /api/tracks/:id
async function getTrack(req, res, next) {
  try {
    const track = await Track.findById(req.params.id).lean();
    if (!track) return res.status(404).json({ message: 'Track not found' });

    // Increment play count (fire-and-forget)
    Track.updateOne({ _id: track._id }, { $inc: { plays: 1 } }).exec();

    res.json({ track });
  } catch (err) {
    next(err);
  }
}

// POST /api/tracks  (multipart form)
async function uploadTrack(req, res, next) {
  try {
    const { title, artist, album, genre, lyrics } = req.body;

    if (!req.files?.audio?.[0]) {
      return res.status(400).json({ message: 'Audio file required' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files?.cover?.[0];

    const track = await Track.create({
      title:         title?.trim(),
      artist:        artist?.trim(),
      album:         album?.trim() || '',
      genre:         genre || 'Other',
      lyricsRaw:     lyrics || '',
      audioPublicId: audioFile.public_id || audioFile.filename,
      audioUrl:      audioFile.path,        // Cloudinary URL
      coverPublicId: coverFile?.public_id || coverFile?.filename || null,
      coverUrl:      coverFile?.path ?? null,
      uploadedBy:    req.user._id,
    });

    res.status(201).json({ track });
  } catch (err) {
    console.error('UPLOAD ERROR DETAILS:', err);
    return res.status(400).json({ message: err.message || 'Upload failed' });
  }
}

// DELETE /api/tracks/:id
async function deleteTrack(req, res, next) {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    // Only owner or admin
    if (
      track.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(track.audioPublicId, { resource_type: 'video' });
    if (track.coverPublicId) {
      await cloudinary.uploader.destroy(track.coverPublicId);
    }

    await track.deleteOne();
    res.json({ message: 'Track deleted' });
  } catch (err) {
    next(err);
  }
}

// POST /api/tracks/:id/like  (toggle)
async function likeTrack(req, res, next) {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    const user   = req.user;
    const liked  = user.likedTracks?.some(id => id.toString() === track._id.toString());

    if (liked) {
      await User.updateOne({ _id: user._id }, { $pull: { likedTracks: track._id } });
      await Track.updateOne({ _id: track._id }, { $inc: { likes: -1 } });
      res.json({ liked: false });
    } else {
      await User.updateOne({ _id: user._id }, { $addToSet: { likedTracks: track._id } });
      await Track.updateOne({ _id: track._id }, { $inc: { likes: 1 } });
      res.json({ liked: true });
    }
  } catch (err) {
    next(err);
  }
}

// GET /api/tracks/:id/lyrics
async function getLyrics(req, res, next) {
  try {
    const track = await Track.findById(req.params.id).select('lyricsRaw').lean();
    if (!track) return res.status(404).json({ message: 'Track not found' });

    const raw    = track.lyricsRaw || '';
    const synced = parseLrc(raw);   // returns [] if no timestamps found

    res.json({ plain: synced.length ? '' : raw, synced });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTracks, getTrack, uploadTrack, deleteTrack, likeTrack, getLyrics };