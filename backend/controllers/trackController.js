'use strict';

const Track    = require('../models/Track');
const User     = require('../models/User');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const { parseLrc } = require('../utils/parseLrc');

function canManageTrack(track, user) {
  return track.uploadedBy.toString() === user._id.toString() || user.role === 'admin';
}

function validateTrackId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function destroyCloudinaryAsset(publicId, resourceType) {
  if (!publicId) return;
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary deletion failed for ${resourceType} asset`);
  }
}

async function cleanupNewUploads(files = {}) {
  const assets = [
    [files.audio?.[0], 'video'],
    [files.cover?.[0], 'image'],
  ].filter(([file]) => file);

  const results = await Promise.allSettled(
    assets.map(([file, type]) =>
      destroyCloudinaryAsset(file.public_id || file.filename, type)
    )
  );
  results.filter(result => result.status === 'rejected')
    .forEach(result => console.error('Failed to clean up uploaded Cloudinary asset:', result.reason));
}

function authorizeTrackOwner(req, res, next) {
  if (!validateTrackId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid track id' });
  }

  Track.findById(req.params.id)
    .then(track => {
      if (!track) return res.status(404).json({ message: 'Track not found' });
      if (!canManageTrack(track, req.user)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      req.track = track;
      next();
    })
    .catch(next);
}

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
    if (!validateTrackId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid track id' });
    }

    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    if (!canManageTrack(track, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const removals = await Promise.allSettled([
      destroyCloudinaryAsset(track.audioPublicId, 'video'),
      destroyCloudinaryAsset(track.coverPublicId, 'image'),
    ]);
    const failedRemoval = removals.find(result => result.status === 'rejected');
    if (failedRemoval) {
      console.error('Failed to delete track media from Cloudinary:', failedRemoval.reason);
      return res.status(502).json({ message: 'Could not remove track media from storage' });
    }

    await track.deleteOne();
    res.json({ message: 'Track deleted' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/tracks/:id (Редактирование трека)
async function updateTrack(req, res, next) {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    // Проверка прав (только владелец или админ)
    if (
      track.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { title, artist, album, genre, lyrics } = req.body;

    if (title) track.title = title.trim();
    if (artist) track.artist = artist.trim();
    if (album !== undefined) track.album = album.trim();
    if (genre) track.genre = genre;
    if (lyrics !== undefined) track.lyricsRaw = lyrics;

    // Если загрузили новую обложку
    if (req.files?.cover?.[0]) {
      if (track.coverPublicId) {
        await cloudinary.uploader.destroy(track.coverPublicId);
      }
      const coverFile = req.files.cover[0];
      track.coverPublicId = coverFile.public_id || coverFile.filename;
      track.coverUrl = coverFile.path;
    }

    await track.save();
    res.json({ track });
  } catch (err) {
    console.error('UPDATE ERROR DETAILS:', err);
    return res.status(400).json({ message: err.message || 'Update failed' });
  }
}

// PUT /api/tracks/:id
async function updateTrack(req, res, next) {
  try {
    const track = req.track;
    const { title, artist, album, genre, lyricsRaw, lyrics } = req.body;
    const fields = { title, artist, album, genre, lyricsRaw: lyricsRaw ?? lyrics };
    if (Object.values(fields).some(value => value !== undefined && typeof value !== 'string')) {
      await cleanupNewUploads(req.files);
      return res.status(400).json({ message: 'Track metadata must be text' });
    }

    const updates = {};
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) updates[key] = value.trim();
    });

    if (updates.title !== undefined && !updates.title) {
      await cleanupNewUploads(req.files);
      return res.status(400).json({ message: 'Title cannot be empty' });
    }
    if (updates.artist !== undefined && !updates.artist) {
      await cleanupNewUploads(req.files);
      return res.status(400).json({ message: 'Artist cannot be empty' });
    }
    if ((updates.title?.length ?? 0) > 200 || (updates.artist?.length ?? 0) > 200 ||
        (updates.album?.length ?? 0) > 200 || (updates.genre?.length ?? 0) > 100 ||
        (updates.lyricsRaw?.length ?? 0) > 100000) {
      await cleanupNewUploads(req.files);
      return res.status(400).json({ message: 'Track metadata exceeds the allowed length' });
    }

    const previousAudioId = track.audioPublicId;
    const previousCoverId = track.coverPublicId;
    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];

    if (audioFile) {
      track.audioPublicId = audioFile.public_id || audioFile.filename;
      track.audioUrl = audioFile.path;
    }
    if (coverFile) {
      track.coverPublicId = coverFile.public_id || coverFile.filename;
      track.coverUrl = coverFile.path;
    }
    Object.assign(track, updates);

    await track.save();

    const oldAssets = [];
    if (audioFile && previousAudioId) oldAssets.push([previousAudioId, 'video']);
    if (coverFile && previousCoverId) oldAssets.push([previousCoverId, 'image']);
    const cleanupResults = await Promise.allSettled(
      oldAssets.map(([publicId, type]) => destroyCloudinaryAsset(publicId, type))
    );
    const cleanupWarning = cleanupResults.some(result => result.status === 'rejected');
    if (cleanupWarning) {
      console.error('Track was updated, but replaced Cloudinary media could not be fully removed:',
        cleanupResults.filter(result => result.status === 'rejected').map(result => result.reason));
    }

    res.json({
      track: track.toObject(),
      ...(cleanupWarning && { cleanupWarning: 'Some replaced media could not be removed from storage.' }),
    });
  } catch (err) {
    await cleanupNewUploads(req.files);
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

module.exports = {
  listTracks, getTrack, uploadTrack, updateTrack, deleteTrack, likeTrack, getLyrics,
  authorizeTrackOwner,
};