'use strict';

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Track   = require('../models/Track');

// GET /api/search?q=query
router.get('/', protect, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ tracks: [] });

    // Use MongoDB full-text search (requires text index on Track)
    const tracks = await Track.find(
      { $text: { $search: q }, isPublic: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(40)
      .lean();

    // Fallback: regex search if no text index results
    const results = tracks.length
      ? tracks
      : await Track.find({
          isPublic: true,
          $or: [
            { title:  { $regex: q, $options: 'i' } },
            { artist: { $regex: q, $options: 'i' } },
            { album:  { $regex: q, $options: 'i' } },
          ],
        })
          .limit(40)
          .lean();

    res.json({ tracks: results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
