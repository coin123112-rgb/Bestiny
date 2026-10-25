'use strict';

const Playlist = require('../models/Playlist');
const Track    = require('../models/Track');

// GET /api/playlists
async function listPlaylists(req, res, next) {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ playlists });
  } catch (err) {
    next(err);
  }
}

// GET /api/playlists/:id
async function getPlaylist(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('tracks')
      .lean();

    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    // Only owner can view private playlists
    if (
      !playlist.isPublic &&
      playlist.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ playlist });
  } catch (err) {
    next(err);
  }
}

// POST /api/playlists
async function createPlaylist(req, res, next) {
  try {
    const { name, description, isPublic } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description?.trim() || '',
      isPublic: isPublic ?? false,
      owner: req.user._id,
    });

    res.status(201).json({ playlist });
  } catch (err) {
    next(err);
  }
}

// POST /api/playlists/:id/tracks
async function addTrack(req, res, next) {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ message: 'trackId required' });

    const [playlist, track] = await Promise.all([
      Playlist.findById(req.params.id),
      Track.findById(trackId),
    ]);

    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (!track)    return res.status(404).json({ message: 'Track not found' });

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Playlist.updateOne(
      { _id: playlist._id },
      { $addToSet: { tracks: track._id } }
    );

    res.json({ message: 'Track added' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/playlists/:id/tracks/:trackId
async function removeTrack(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Playlist.updateOne(
      { _id: playlist._id },
      { $pull: { tracks: req.params.trackId } }
    );

    res.json({ message: 'Track removed' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/playlists/:id
async function deletePlaylist(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await playlist.deleteOne();
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPlaylists, getPlaylist, createPlaylist,
  addTrack, removeTrack, deletePlaylist,
};
