import axios from 'axios';

// ── Base instance (regular requests, 15s timeout) ─────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') ?? localStorage.getItem('sp_token') ?? '';
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('sp_token');
      delete api.defaults.headers.common['Authorization'];
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.replace('/login');
      }
    }

    const message =
      err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Track helpers ─────────────────────────────────────────────────────────
export const fetchTracks  = (params) => api.get('/tracks', { params });
export const fetchTrack   = (id)     => api.get(`/tracks/${id}`);
export const likeTrack    = (id)     => api.post(`/tracks/${id}/like`);
export const deleteTrack  = (id)     => api.delete(`/tracks/${id}`);
export const updateTrack  = (id, formData) =>
  api.put(`/tracks/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

/**
 * Upload track — separate instance with:
 *  - 120 second timeout (large file + cold server start on Render)
 *  - multipart/form-data header (automatically set via boundary)
 *  - real onUploadProgress callback so the UI can show progress
 */
export const uploadTrack = (formData, onProgress) => {
  const token = localStorage.getItem('token') ?? localStorage.getItem('sp_token') ?? '';

  return axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 120000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).post('/tracks', formData, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
};

// ── Playlist helpers ──────────────────────────────────────────────────────
export const fetchPlaylists     = ()         => api.get('/playlists');
export const fetchPlaylist      = (id)       => api.get(`/playlists/${id}`);
export const createPlaylist     = (data)     => api.post('/playlists', data);
export const addToPlaylist      = (id, tid)  => api.post(`/playlists/${id}/tracks`, { trackId: tid });
export const removeFromPlaylist = (id, tid)  => api.delete(`/playlists/${id}/tracks/${tid}`);

// ── Search ────────────────────────────────────────────────────────────────
export const searchAll = (q) => api.get('/search', { params: { q } });

// ── Lyrics ────────────────────────────────────────────────────────────────
export const fetchLyrics = (id) => api.get(`/tracks/${id}/lyrics`);