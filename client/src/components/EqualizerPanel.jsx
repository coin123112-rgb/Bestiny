import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const BANDS = [
  { label: 'Sub',  freq: '60 Hz'   },
  { label: 'Bass', freq: '250 Hz'  },
  { label: 'Mid',  freq: '1 kHz'   },
  { label: 'High', freq: '4 kHz'   },
  { label: 'Air',  freq: '12 kHz'  },
];

const PRESETS = ['flat', 'bass', 'treble', 'vocal', 'rock', 'classical'];

export default function EqualizerPanel() {
  const { setShowEq, setEqBand, applyEqPreset } = usePlayer();
  const [gains,        setGains]        = useState([0, 0, 0, 0, 0]);
  const [activePreset, setActivePreset] = useState('flat');

  const handleBandChange = (i, val) => {
    const db = parseInt(val, 10);
    const next = [...gains];
    next[i] = db;
    setGains(next);
    setEqBand(i, db);
    setActivePreset('custom');
  };

  const handlePreset = (preset) => {
    const vals = applyEqPreset(preset);
    setGains(vals);
    setActivePreset(preset);
  };

  return (
    <div
      className="fixed bottom-28 right-6 z-30 glass-card p-5 w-80
                 shadow-2xl animate-slide-up"
      aria-label="Equalizer"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base">Equalizer</h3>
        <button
          onClick={() => setShowEq(false)}
          className="text-sp-muted hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {PRESETS.map(p => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all
                        ${activePreset === p
                          ? 'bg-sp-green text-black'
                          : 'bg-white/10 text-sp-muted hover:text-white'}`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="flex items-end justify-between gap-2 h-32">
        {BANDS.map((band, i) => (
          <div key={band.label} className="flex flex-col items-center gap-2 flex-1">
            {/* dB label */}
            <span className={`text-[11px] font-mono tabular-nums
                              ${gains[i] > 0 ? 'text-sp-green' : gains[i] < 0 ? 'text-red-400' : 'text-sp-muted'}`}>
              {gains[i] > 0 ? '+' : ''}{gains[i]}
            </span>

            {/* Vertical fader */}
            <input
              type="range"
              className="eq-fader"
              min={-12}
              max={12}
              step={1}
              value={gains[i]}
              onChange={e => handleBandChange(i, e.target.value)}
              aria-label={`${band.label} EQ band`}
            />

            {/* Labels */}
            <span className="text-[10px] font-semibold text-sp-muted">{band.label}</span>
            <span className="text-[9px] text-sp-muted/50">{band.freq}</span>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={() => handlePreset('flat')}
        className="mt-4 w-full py-1.5 rounded-xl text-xs text-sp-muted
                   hover:text-white bg-white/5 hover:bg-white/10 transition-all"
      >
        Reset to Flat
      </button>
    </div>
  );
}
