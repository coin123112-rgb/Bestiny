'use strict';

require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const mongoose   = require('mongoose');
const path       = require('path');

const authRoutes     = require('./routes/auth');
const trackRoutes    = require('./routes/tracks');
const playlistRoutes = require('./routes/playlists');
const searchRoutes   = require('./routes/search');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security ───────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
}));

// ── Parsing ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(morgan('dev'));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/tracks',    trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/search',    searchRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.statusCode ?? 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

// ── DB + Start ─────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB ?? 'sonicpulse',
  })
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app; // for Vercel
