import React, {
  createContext, useContext, useState, useRef,
  useCallback, useEffect
} from 'react';
import { Howl } from 'howler';
import { useAuth } from './AuthContext';

// Lazy import to avoid circular deps — App exports this context
let _openGuestModal = null;
export function _setGuestModalOpener(fn) { _openGuestModal = fn; }

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { user } = useAuth();
  const [queue,        setQueue]        = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [duration,     setDuration]     = useState(0);
  const [seek,         setSeek]         = useState(0);
  const [volume,       setVolume]       = useState(0.8);
  const [shuffle,      setShuffle]      = useState(false);
  const [repeat,       setRepeat]       = useState('none'); // none | one | all
  const [showLyrics,   setShowLyrics]   = useState(false);
  const [showEq,       setShowEq]       = useState(false);

  // Web Audio API nodes (equalizer)
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const eqBandsRef  = useRef([]);
  const howlRef     = useRef(null);
  const seekTimerRef = useRef(null);

  const currentTrack = queue[currentIndex] ?? null;

  // ─── Init Web Audio Context ───────────────────────────────────────────────
  const initAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.value = volume;

    // 5-band parametric EQ: Sub-bass, Bass, Mid, Treble, Presence
    const bands = [
      { freq: 60,   type: 'lowshelf'  },
      { freq: 250,  type: 'peaking'   },
      { freq: 1000, type: 'peaking'   },
      { freq: 4000, type: 'peaking'   },
      { freq: 12000,type: 'highshelf' },
    ];
    const filters = bands.map(({ freq, type }) => {
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.gain.value = 0;
      f.Q.value = 1;
      return f;
    });

    // Chain: source → filters → gain → destination
    filters.reduce((prev, cur) => { prev.connect(cur); return cur; });
    filters[filters.length - 1].connect(gain);
    gain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gain;
    eqBandsRef.current  = filters;
  }, [volume]);

  // ─── Load & Play a track ─────────────────────────────────────────────────
  const loadTrack = useCallback((track, autoPlay = true) => {
    if (!track) return;
    initAudioContext();

    // Destroy previous Howl
    if (howlRef.current) {
      howlRef.current.unload();
      clearInterval(seekTimerRef.current);
    }

    const howl = new Howl({
      src: [track.audioUrl],
      html5: true,        // streaming
      volume,
      onload() {
        setDuration(howl.duration());
        if (autoPlay) { howl.play(); setIsPlaying(true); }
      },
      onend() {
        if (repeat === 'one') { howl.seek(0); howl.play(); return; }
        goNext();
      },
      onplay() {
        setIsPlaying(true);
        seekTimerRef.current = setInterval(() => {
          setSeek(howl.seek() || 0);
        }, 500);
      },
      onpause() {
        setIsPlaying(false);
        clearInterval(seekTimerRef.current);
      },
      onstop() {
        setIsPlaying(false);
        clearInterval(seekTimerRef.current);
        setSeek(0);
      },
    });

    howlRef.current = howl;
    setSeek(0);
    setDuration(0);
  }, [volume, repeat, initAudioContext]); // eslint-disable-line

  // ─── Sync volume ─────────────────────────────────────────────────────────
  useEffect(() => {
    howlRef.current?.volume(volume);
    if (gainNodeRef.current) gainNodeRef.current.gain.value = volume;
  }, [volume]);

  // ─── Reload when track changes ────────────────────────────────────────────
  useEffect(() => {
    if (currentTrack) loadTrack(currentTrack, isPlaying || false);
  }, [currentIndex]); // eslint-disable-line

  // ─── Controls ────────────────────────────────────────────────────────────
  const playTrack = useCallback((track, list = null) => {
    // Guests: show modal first, then play on "Later"
    if (!user && _openGuestModal) {
      _openGuestModal(() => _doPlayTrack(track, list));
      return;
    }
    _doPlayTrack(track, list);
  }, [queue, loadTrack, user]); // eslint-disable-line

  const _doPlayTrack = useCallback((track, list = null) => {
    if (list) {
      const idx = list.findIndex(t => t._id === track._id);
      setQueue(list);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      const idx = queue.findIndex(t => t._id === track._id);
      if (idx >= 0) setCurrentIndex(idx);
    }
    loadTrack(track, true);
    setIsPlaying(true);
  }, [queue, loadTrack]);

  const togglePlay = useCallback(() => {
    if (!howlRef.current) return;
    if (howlRef.current.playing()) { howlRef.current.pause(); }
    else                           { howlRef.current.play();  }
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => {
      let next;
      if (shuffle) { next = Math.floor(Math.random() * queue.length); }
      else         { next = (prev + 1) % queue.length; }
      if (next === prev && queue.length === 1 && repeat === 'none') return prev;
      return next;
    });
  }, [shuffle, queue.length, repeat]);

  const goPrev = useCallback(() => {
    if (seek > 3) { howlRef.current?.seek(0); setSeek(0); return; }
    setCurrentIndex(prev => (prev - 1 + queue.length) % queue.length);
  }, [seek, queue.length]);

  const seekTo = useCallback((val) => {
    howlRef.current?.seek(val);
    setSeek(val);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const cycleRepeat   = useCallback(() =>
    setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none'), []);

  // ─── EQ ──────────────────────────────────────────────────────────────────
  const setEqBand = useCallback((index, gainDb) => {
    if (eqBandsRef.current[index])
      eqBandsRef.current[index].gain.value = gainDb;
  }, []);

  const applyEqPreset = useCallback((preset) => {
    const presets = {
      flat:     [0,  0,  0,  0,  0],
      bass:     [6,  4,  0, -2, -2],
      treble:   [-2,-1,  0,  4,  6],
      vocal:    [-2, 0,  4,  3,  1],
      rock:     [4,  2,  0,  2,  4],
      classical:[0, -2,  0,  2,  4],
    };
    const vals = presets[preset] ?? presets.flat;
    vals.forEach((db, i) => setEqBand(i, db));
    return vals;
  }, [setEqBand]);

  // ─── Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => () => {
    howlRef.current?.unload();
    clearInterval(seekTimerRef.current);
    audioCtxRef.current?.close();
  }, []);

  const value = {
    queue, setQueue,
    currentIndex, setCurrentIndex,
    currentTrack,
    isPlaying,
    duration, seek, seekTo,
    volume, setVolume,
    shuffle, toggleShuffle,
    repeat, cycleRepeat,
    showLyrics, setShowLyrics,
    showEq,    setShowEq,
    playTrack, togglePlay,
    goNext, goPrev,
    setEqBand, applyEqPreset,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
