import React from 'react';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { likeTrack } from '../services/api';
import { formatTime } from '../utils/formatTime';

// ── Single track card (grid view) ─────────────────────────────────────────
function TrackCard({ track, list, index }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const isActive = currentTrack?._id === track._id;

  const handlePlay = (e) => {
    e.stopPropagation();
    playTrack(track, list);
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
          <button
            onClick={handleLike}
            className={`transition-colors ${track.liked ? 'text-sp-green' : 'text-sp-muted hover:text-white'}`}
          >
            <Heart size={14} fill={track.liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Grid container ─────────────────────────────────────────────────────────
export default function TrackGrid({ tracks = [], title, subtitle, loading }) {
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
        {tracks.map((track, i) => (
          <TrackCard key={track._id} track={track} list={tracks} index={i} />
        ))}
      </div>
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
