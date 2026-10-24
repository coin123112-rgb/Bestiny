import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

/**
 * Compact floating player shown on mobile above the BottomNav.
 * Only visible on mobile (md:hidden).
 */
export default function MiniPlayer() {
  const {
    currentTrack, isPlaying, togglePlay, goNext, seek, duration,
  } = usePlayer();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (seek / duration) * 100 : 0;

  return (
    <div
      className="fixed left-2 right-2 z-30 md:hidden"
      // Sits just above the BottomNav (h-14 = 56px) + 4px gap
      style={{ bottom: 'calc(56px + 4px)' }}
    >
      <div
        className="flex items-center gap-3 px-3 py-2.5
                   bg-[#1a1a1a]/95 backdrop-blur-md
                   rounded-xl border border-white/8 shadow-lg shadow-black/50"
      >
        {/* Cover */}
        <img
          src={currentTrack.coverUrl || '/icons/default-cover.svg'}
          alt={currentTrack.title}
          className={`w-10 h-10 rounded-lg object-cover shrink-0
                      ${isPlaying ? 'neon-glow' : 'border border-white/10'}`}
        />

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate text-white"
            translate="no"
          >
            {currentTrack.title}
          </p>
          <p className="text-xs text-sp-muted truncate" translate="no">
            {currentTrack.artist}
          </p>
          {/* Thin progress bar */}
          <div className="mt-1.5 h-0.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-sp-green rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-sp-green flex items-center justify-center
                       text-black shadow-[0_0_12px_#1DB95455]
                       active:scale-95 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause size={17} fill="black" />
              : <Play  size={17} fill="black" className="ml-0.5" />
            }
          </button>

          <button
            onClick={goNext}
            className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center
                       text-sp-muted hover:text-white transition-colors active:scale-95"
            aria-label="Next"
          >
            <SkipForward size={17} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
