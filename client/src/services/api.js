import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler – surface friendly messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Track helpers ──────────────────────────────────────────────────────────
export const fetchTracks     = (params) => api.get('/tracks', { params });
export const fetchTrack      = (id)     => api.get(`/tracks/${id}`);
export const uploadTrack     = (form)   => api.post('/tracks', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const likeTrack       = (id)     => api.post(`/tracks/${id}/like`);
export const deleteTrack     = (id)     => api.delete(`/tracks/${id}`);

// ── Playlist helpers ───────────────────────────────────────────────────────
export const fetchPlaylists  = ()       => api.get('/playlists');
export const fetchPlaylist   = (id)     => api.get(`/playlists/${id}`);
export const createPlaylist  = (data)   => api.post('/playlists', data);
export const addToPlaylist   = (id, tid)=> api.post(`/playlists/${id}/tracks`, { trackId: tid });
export const removeFromPlaylist = (id, tid) =>
  api.delete(`/playlists/${id}/tracks/${tid}`);

// ── Search ─────────────────────────────────────────────────────────────────
export const searchAll       = (q)      => api.get('/search', { params: { q } });

// ── Lyrics ─────────────────────────────────────────────────────────────────
export const fetchLyrics     = (id)     => api.get(`/tracks/${id}/lyrics`);
