import React, { useRef, useEffect } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Volume2, Volume1, VolumeX,
  Mic2, Sliders, Maximize2,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,  togglePlay,
    goNext,     goPrev,
    shuffle,    toggleShuffle,
    repeat,     cycleRepeat,
    seek,       seekTo,    duration,
    volume,     setVolume,
    showLyrics, setShowLyrics,
    showEq,     setShowEq,
  } = usePlayer();

  const seekRef = useRef(null);
  const volRef  = useRef(null);

  useEffect(() => {
    if (seekRef.current && duration > 0) {
      seekRef.current.style.setProperty('--progress', `${(seek / duration) * 100}%`);
    }
  }, [seek, duration]);

  useEffect(() => {
    if (volRef.current) {
      volRef.current.style.setProperty('--progress', `${volume * 100}%`);
    }
  }, [volume]);

  const VolumeIcon  = volume === 0 ? VolumeX : volume < 0.4 ? Volume1 : Volume2;
  const RepeatIcon  = repeat === 'one' ? Repeat1 : Repeat;

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!currentTrack) {
    return (
      <div className="h-16 sm:h-20 border-t border-white/5 bg-black/60 backdrop-blur-md
                      flex items-center justify-center px-4">
        <p className="text-sp-muted text-xs sm:text-sm">Select a track to start listening</p>
      </div>
    );
  }

  return (
    <div
      className="border-t border-white/5 bg-black/70 backdrop-blur-xl shrink-0 z-20"
      aria-label="Audio player"
    >
      {/* ── Seek bar (full width, top of bar) — visible on all sizes ──── */}
      <div className="px-3 pt-2 hidden sm:flex items-center gap-2">
        <span className="text-[11px] text-sp-muted w-9 text-right tabular-nums shrink-0">
          {formatTime(seek)}
        </span>
        <input
          ref={seekRef}
          type="range"
          min={0}
          max={duration || 1}
          step={0.5}
          value={seek}
          onChange={e => seekTo(parseFloat(e.target.value))}
          className="range-slider flex-1"
          aria-label="Seek"
        />
        <span className="text-[11px] text-sp-muted w-9 tabular-nums shrink-0">
          {formatTime(duration)}
        </span>
      </div>

      {/* ── Main controls row ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5">

        {/* Left: track info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <img
              src={currentTrack.coverUrl || '/icons/default-cover.svg'}
              alt={currentTrack.title}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover
                          ${isPlaying ? 'neon-glow' : 'border border-white/10'}`}
            />
            {isPlaying && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2
                              flex items-end gap-[2px] h-3">
                <span className="wave-bar h-[5px]"  />
                <span className="wave-bar h-[8px]"  style={{ animationDelay: '0.15s' }} />
                <span className="wave-bar h-[10px]" style={{ animationDelay: '0.3s'  }} />
                <span className="wave-bar h-[6px]"  style={{ animationDelay: '0.45s' }} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold truncate">{currentTrack.title}</p>
            <p className="text-[10px] sm:text-xs text-sp-muted truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Centre: core controls (always visible) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Shuffle — hidden on mobile */}
          <button
            onClick={toggleShuffle}
            className={`hidden sm:flex transition-colors
                        ${shuffle ? 'text-sp-green' : 'text-sp-muted hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle size={17} />
          </button>

          <button
            onClick={goPrev}
            className="text-sp-muted hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack size={19} fill="currentColor" />
          </button>

          {/* Play / Pause — primary action */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sp-green hover:bg-sp-green-alt
                       flex items-center justify-center text-black
                       shadow-[0_0_16px_#1DB95466] hover:shadow-[0_0_28px_#00FF6655]
                       transition-all duration-200 active:scale-95 shrink-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause size={20} fill="black" />
              : <Play  size={20} fill="black" className="ml-0.5" />
            }
          </button>

          <button
            onClick={goNext}
            className="text-sp-muted hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward size={19} fill="currentColor" />
          </button>

          {/* Repeat — hidden on mobile */}
          <button
            onClick={cycleRepeat}
            className={`hidden sm:flex transition-colors
                        ${repeat !== 'none' ? 'text-sp-green' : 'text-sp-muted hover:text-white'}`}
            title={`Repeat: ${repeat}`}
          >
            <RepeatIcon size={17} />
          </button>
        </div>

        {/* Right: extras + volume (desktop) / lyrics+eq (mobile) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
          {/* Lyrics */}
          <button
            onClick={() => setShowLyrics(l => !l)}
            className={`transition-colors ${showLyrics ? 'text-sp-green' : 'text-sp-muted hover:text-white'}`}
            title="Lyrics"
          >
            <Mic2 size={17} />
          </button>

          {/* EQ */}
          <button
            onClick={() => setShowEq(e => !e)}
            className={`hidden sm:flex transition-colors
                        ${showEq ? 'text-sp-green' : 'text-sp-muted hover:text-white'}`}
            title="Equalizer"
          >
            <Sliders size={17} />
          </button>

          {/* Volume — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setVolume(v => v > 0 ? 0 : 0.8)}
              className="text-sp-muted hover:text-white transition-colors shrink-0"
              title="Mute/Unmute"
            >
              <VolumeIcon size={17} />
            </button>
            <input
              ref={volRef}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="range-slider w-20"
              aria-label="Volume"
            />
          </div>

          {/* Fullscreen — desktop only */}
          <button
            className="hidden sm:flex text-sp-muted hover:text-white transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Mobile seek bar (below controls) ─────────────────────────────── */}
      <div className="px-3 pb-2 flex items-center gap-2 sm:hidden">
        <span className="text-[10px] text-sp-muted w-8 text-right tabular-nums shrink-0">
          {formatTime(seek)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.5}
          value={seek}
          onChange={e => seekTo(parseFloat(e.target.value))}
          className="range-slider flex-1"
          style={{ '--progress': `${duration > 0 ? (seek / duration) * 100 : 0}%` }}
          aria-label="Seek"
        />
        <span className="text-[10px] text-sp-muted w-8 tabular-nums shrink-0">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
