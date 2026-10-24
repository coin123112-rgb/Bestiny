# 🎵 Sonic Pulse

A full-stack music streaming PWA — your personal Spotify alternative.

## Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Frontend   | React 18 + Vite, Tailwind CSS, Lucide Icons     |
| PWA        | vite-plugin-pwa, Workbox                        |
| Audio      | Howler.js (streaming) + Web Audio API (EQ)      |
| Backend    | Node.js + Express                               |
| Database   | MongoDB + Mongoose                              |
| Media CDN  | Cloudinary (audio + cover images)               |
| Auth       | bcryptjs + JWT                                  |
| Security   | helmet, CORS, express-rate-limit                |
| Deploy     | Vercel (serverless)                             |

## Quick Start

### 1. Clone & Install

```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

```bash
cp .env.example server/.env
# Fill in your MongoDB URI, JWT secret, and Cloudinary credentials
```

### 3. Run Locally

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

App runs at **http://localhost:5173**

---

## Project Structure

```
sonic-pulse/
├── client/                   # React + Vite frontend
│   ├── public/icons/         # PWA icons (72–512px)
│   ├── src/
│   │   ├── components/       # Sidebar, PlayerBar, TrackGrid, EQ, Lyrics…
│   │   ├── context/          # AuthContext, PlayerContext
│   │   ├── pages/            # Home, Search, Library, Playlist, Upload
│   │   ├── services/api.js   # Axios instance + API helpers
│   │   └── utils/            # formatTime, parseLrc
│   ├── vite.config.js        # Vite + PWA config
│   └── tailwind.config.js
│
├── server/                   # Express API
│   ├── config/cloudinary.js  # Multer-Cloudinary storage
│   ├── controllers/          # authController, trackController, playlistController
│   ├── middleware/auth.js    # JWT protect middleware
│   ├── models/               # User, Track, Playlist
│   ├── routes/               # auth, tracks, playlists, search
│   ├── utils/parseLrc.js     # LRC lyrics parser
│   └── index.js              # Express app entry
│
├── vercel.json               # Vercel deploy config
├── .env.example              # Environment variable template
└── .gitignore
```

---

## PWA Installation

On supported browsers (Chrome, Edge, Safari iOS 16.4+), users see an **"Install Sonic Pulse"** banner at the bottom of the screen. One tap installs the app to the home screen / taskbar in standalone mode (no browser chrome).

---

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. In **Settings → Upload**, enable **Unsigned uploading** or use signed uploads (already configured)
3. Copy your Cloud Name, API Key, and API Secret into `.env`

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Set all environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.
