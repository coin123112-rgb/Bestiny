import React, { useEffect, useState } from 'react';
import { Play, Heart, MoreHorizontal, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { deleteTrack, likeTrack, updateTrack } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../utils/formatTime';

// ── Single track card (grid view) ─────────────────────────────────────────
function TrackCard({ track, list, index, canEdit, onEdit, onDeleted }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const isActive = currentTrack?._id === track._id;
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const handlePlay = (e) => {
    e.stopPropagation();
    playTrack(track, list);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${track.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    setActionError('');
    try {
      await deleteTrack(track._id);
      onDeleted(track._id);
    } catch (err) {
      setActionError(err.message || 'Could not delete track.');
      setDeleting(false);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try { await likeTrack(track._id); } catch {}
  };

  return (
    <div
      className={`group relative glass-card p-3 cursor-pointer
                  hover:bg-white/10 transition-all duration-200
                  ${isActive ? 'border-sp-green/40 bg-white/8' : ''}`}
      onClick={() => playTrack(track, list)}
    >
      {/* Cover image */}
      <div className="relative overflow-hidden rounded-xl aspect-square mb-3">
        <img
          src={track.coverUrl || '/icons/default-cover.svg'}
          alt={track.title}
          className={`w-full h-full object-cover transition-transform duration-300
                      group-hover:scale-105
                      ${isActive ? 'neon-glow' : ''}`}
          loading="lazy"
        />

        {/* Play button overlay */}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-sp-green
                     flex items-center justify-center text-black
                     shadow-[0_4px_20px_#1DB95466]
                     opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                     transition-all duration-250"
          aria-label={`Play ${track.title}`}
        >
          <Play size={18} fill="black" className="ml-0.5" />
        </button>

        {/* Now playing bars */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-end gap-[2px] h-4">
            <span className="wave-bar h-[6px]"  />
            <span className="wave-bar h-[10px]" style={{ animationDelay: '0.15s' }} />
            <span className="wave-bar h-[14px]" style={{ animationDelay: '0.3s'  }} />
            <span className="wave-bar h-[8px]"  style={{ animationDelay: '0.45s' }} />
          </div>
        )}

        {/* Track number */}
        {index !== undefined && (
          <span className="absolute top-2 left-2 text-[11px] font-bold text-white/60
                           bg-black/50 px-1.5 py-0.5 rounded">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className={`text-sm font-semibold truncate ${isActive ? 'text-sp-green' : 'text-white'}`}>
            {track.title}
          </p>
          <p className="text-xs text-sp-muted truncate">{track.artist}</p>
          {track.album && (
            <p className="text-[11px] text-sp-muted/60 truncate mt-0.5">{track.album}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[11px] text-sp-muted tabular-nums">
            {formatTime(track.duration ?? 0)}
          </span>
          {canEdit && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onEdit(track); }}
                className="p-1 text-sp-muted hover:text-white transition-colors"
                aria-label={`Edit ${track.title}`}
                title="Edit track"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 text-sp-muted hover:text-red-400 disabled:opacity-50 transition-colors"
                aria-label={`Delete ${track.title}`}
                title="Delete track"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={Boolean(track.liked)}
            aria-label={track.liked ? 'Unlike track' : 'Like track'}
            className={`transition-colors ${track.liked ? 'text-sp-green' : 'text-sp-muted hover:text-white'}`}
          >
            <Heart size={14} fill={track.liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      {actionError && <p role="alert" className="mt-2 text-xs text-red-400">{actionError}</p>}
    </div>
  );
}

// ── Grid container ─────────────────────────────────────────────────────────
function EditTrackModal({ track, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: track.title || '',
    artist: track.artist || '',
    album: track.album || '',
    genre: track.genre || 'Other',
    lyricsRaw: track.lyricsRaw || '',
  });
  const [cover, setCover] = useState(null);
  const [audio, setAudio] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (cover) data.append('cover', cover);
    if (audio) data.append('audio', audio);

    try {
      const response = await updateTrack(track._id, data);
      onSaved(response.data.track, response.data.cleanupWarning);
    } catch (err) {
      setError(err.message || 'Could not save track.');
      setSaving(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-white/10 bg-sp-surface px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sp-green/50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="edit-track-title" className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1d23] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="edit-track-title" className="text-lg font-bold">Edit track</h2>
          <button type="button" onClick={onClose} className="text-sp-muted hover:text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className={inputClass} aria-label="Title" maxLength={200} required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" />
          <input className={inputClass} aria-label="Artist" maxLength={200} required value={form.artist} onChange={e => setForm({ ...form, artist: e.target.value })} placeholder="Artist" />
          <input className={inputClass} aria-label="Album" maxLength={200} value={form.album} onChange={e => setForm({ ...form, album: e.target.value })} placeholder="Album" />
          <input className={inputClass} aria-label="Genre" maxLength={100} value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} placeholder="Genre" />
          <textarea className={`${inputClass} min-h-28 resize-y`} aria-label="Lyrics" maxLength={100000} value={form.lyricsRaw} onChange={e => setForm({ ...form, lyricsRaw: e.target.value })} placeholder="Lyrics (optional)" />
          <label className="block text-sm text-sp-muted">
            Replace cover
            <input className="mt-1 block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setCover(e.target.files?.[0] ?? null)} />
          </label>
          <label className="block text-sm text-sp-muted">
            Replace audio (optional)
            <input className="mt-1 block w-full text-xs" type="file" accept="audio/*" onChange={e => setAudio(e.target.files?.[0] ?? null)} />
          </label>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-4 py-2 text-sm text-sp-muted hover:text-white disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-sp-green px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function TrackGrid({ tracks = [], title, subtitle, loading, editable = false, onTrackDeleted, onTrackUpdated }) {
  const { user } = useAuth();
  const [editingTrack, setEditingTrack] = useState(null);
  const [saveNotice, setSaveNotice] = useState('');

  useEffect(() => {
    if (!saveNotice) return undefined;
    const timeout = setTimeout(() => setSaveNotice(''), 4000);
    return () => clearTimeout(timeout);
  }, [saveNotice]);

  if (loading) {
    return (
      <div className="p-6">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        <div className="track-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="glass-card p-3 animate-pulse">
              <div className="aspect-square rounded-xl bg-white/5 mb-3" />
              <div className="h-3 bg-white/5 rounded mb-2 w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div className="p-6">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        <div className="flex flex-col items-center justify-center py-20 text-sp-muted">
          <p className="text-lg">No tracks found</p>
          <p className="text-sm mt-1">Upload some music or adjust your search.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="p-6">
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {subtitle && <p className="text-sp-muted text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="track-grid">
        {tracks.map((track, i) => {
          const ownerId = track.uploadedBy?._id ?? track.uploadedBy;
          const canEdit = editable && user?._id && String(ownerId) === String(user._id);
          return (
            <TrackCard
              key={track._id}
              track={track}
              list={tracks}
              index={i}
              canEdit={canEdit}
              onEdit={setEditingTrack}
              onDeleted={onTrackDeleted}
            />
          );
        })}
      </div>
      {saveNotice && <p role="status" className="mt-3 text-sm text-amber-300">{saveNotice}</p>}
      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSaved={(updatedTrack, warning) => {
            onTrackUpdated(updatedTrack);
            setEditingTrack(null);
            setSaveNotice(warning || 'Track updated.');
          }}
        />
      )}
    </section>
  );
}

// ── List / table view for playlist detail ──────────────────────────────────
export function TrackList({ tracks = [], onRemove }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  return (
    <div className="px-6 pb-6 space-y-1">
      {tracks.map((track, i) => {
        const isActive = currentTrack?._id === track._id;
        return (
          <div
            key={track._id}
            onClick={() => playTrack(track, tracks)}
            className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer
                        transition-all duration-150 hover:bg-white/5
                        ${isActive ? 'bg-white/8' : ''}`}
          >
            {/* Index / wave */}
            <span className="w-5 text-center text-sm text-sp-muted tabular-nums">
              {isActive && isPlaying
                ? <span className="flex gap-[2px] items-end h-4 justify-center">
                    <span className="wave-bar h-[6px]"  />
                    <span className="wave-bar h-[10px]" style={{ animationDelay: '0.15s' }} />
                    <span className="wave-bar h-[8px]"  style={{ animationDelay: '0.3s'  }} />
                  </span>
                : i + 1}
            </span>

            <img
              src={track.coverUrl || '/icons/default-cover.svg'}
              className="w-10 h-10 rounded-lg object-cover"
              alt=""
            />

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isActive ? 'text-sp-green' : ''}`}>
                {track.title}
              </p>
              <p className="text-xs text-sp-muted truncate">{track.artist}</p>
            </div>

            <span className="text-xs text-sp-muted tabular-nums">
              {formatTime(track.duration ?? 0)}
            </span>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={e => { e.stopPropagation(); playTrack(track, tracks); }}
                className="w-8 h-8 rounded-full bg-sp-green flex items-center justify-center text-black"
              >
                <Play size={14} fill="black" className="ml-0.5" />
              </button>
              {onRemove && (
                <button
                  onClick={e => { e.stopPropagation(); onRemove(track._id); }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                             text-sp-muted hover:text-red-400 transition-colors"
                >
                  <MoreHorizontal size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
