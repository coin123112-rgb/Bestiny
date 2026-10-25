import React, { useEffect, useState, useRef } from 'react';
import { X, Mic2, Music2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { fetchLyrics } from '../services/api';

export default function LyricsModal() {
  const { currentTrack, seek, setShowLyrics } = usePlayer();
  const [lines,       setLines]       = useState([]);   // [{ time, text }]
  const [rawLyrics,   setRawLyrics]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef  = useRef(null);
  const lineRefs      = useRef([]);

  useEffect(() => {
    if (!currentTrack) return;
    setLoading(true);
    setLines([]);
    setRawLyrics('');

    fetchLyrics(currentTrack._id)
      .then(({ data }) => {
        if (data.synced?.length) {
          setLines(data.synced);
        } else if (data.plain) {
          setRawLyrics(data.plain);
        }
      })
      .catch(() => setRawLyrics('No lyrics available for this track.'))
      .finally(() => setLoading(false));
  }, [currentTrack?._id]);

  // Sync active line to seek position
  useEffect(() => {
    if (!lines.length) return;
    let idx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (seek >= lines[i].time) idx = i;
    }
    setActiveIndex(idx);
  }, [seek, lines]);

  // Scroll active line into view
  useEffect(() => {
    const el = lineRefs.current[activeIndex];
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4"
      onClick={() => setShowLyrics(false)}
    >
      <div
        className="w-full max-w-lg glass-card flex flex-col"
        style={{ maxHeight: '70vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <Mic2 size={20} className="text-sp-green" />
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{currentTrack?.title}</p>
            <p className="text-sm text-sp-muted truncate">{currentTrack?.artist}</p>
          </div>
          <button
            onClick={() => setShowLyrics(false)}
            className="text-sp-muted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 text-center"
        >
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-sp-green border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && lines.length > 0 && lines.map((line, i) => (
            <p
              key={i}
              ref={el => (lineRefs.current[i] = el)}
              className={`transition-all duration-300 text-lg leading-relaxed cursor-pointer
                          ${i === activeIndex
                            ? 'text-white font-bold scale-105 text-sp-green'
                            : i < activeIndex
                              ? 'text-sp-muted/40 text-base'
                              : 'text-sp-muted/70 text-base'}`}
              onClick={() => {/* Could seek to line.time */}}
            >
              {line.text || '\u00A0'}
            </p>
          ))}

          {!loading && !lines.length && rawLyrics && (
            <pre className="text-sp-muted whitespace-pre-wrap font-sans text-sm leading-7 text-left">
              {rawLyrics}
            </pre>
          )}

          {!loading && !lines.length && !rawLyrics && (
            <div className="flex flex-col items-center py-12 text-sp-muted gap-3">
              <Music2 size={40} className="opacity-30" />
              <p>No lyrics available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
