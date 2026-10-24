import React, { useState, useRef } from 'react';
import { Upload, Music2, Image, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import { uploadTrack } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GENRES = ['Pop','Rock','Hip-Hop','Electronic','R&B','Jazz','Classical','Lo-Fi','Metal','Other'];

// Error boundary to prevent blank screen on import errors
class UploadErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20 text-sp-muted gap-4">
          <AlertCircle size={40} className="text-red-400 opacity-60" />
          <p className="text-lg font-semibold text-white">Something went wrong</p>
          <p className="text-sm">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-sp-green text-black rounded-xl font-bold text-sm"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UploadPage() {
  const { user } = useAuth();
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [audioFile, setAudioFile]   = useState(null);
  const [coverFile, setCoverFile]   = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [form, setForm]             = useState({
    title: '', artist: '', album: '', genre: 'Pop', lyrics: '',
  });
  const [progress, setProgress]     = useState(0);
  const [status, setStatus]         = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg]     = useState('');

  const handleAudio = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioFile(file);
    if (!form.title) setForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, '') }));
  };

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) { setErrorMsg('Please select an audio file.'); return; }
    if (!form.title.trim() || !form.artist.trim()) {
      setErrorMsg('Title and artist are required.'); return;
    }

    const data = new FormData();
    data.append('audio', audioFile);
    if (coverFile) data.append('cover', coverFile);
    Object.entries(form).forEach(([k, v]) => data.append(k, v));

    setStatus('uploading');
    setErrorMsg('');
    try {
      await uploadTrack(data);
      setStatus('success');
      // Reset
      setAudioFile(null); setCoverFile(null); setCoverPreview(null);
      setForm({ title:'', artist:'', album:'', genre:'Pop', lyrics:'' });
      setProgress(0);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Upload failed');
    }
  };

  return (
    <div className="min-h-full">
      <Header title="Upload Track" />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Audio drop zone */}
          <div
            onClick={() => audioInputRef.current?.click()}
            className={`glass-card p-8 flex flex-col items-center justify-center gap-3
                        cursor-pointer border-2 border-dashed transition-all
                        ${audioFile ? 'border-sp-green/60 bg-sp-green/5' : 'border-white/10 hover:border-white/30'}`}
          >
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudio}
              className="hidden"
            />
            {audioFile
              ? <>
                  <Music2 size={36} className="text-sp-green" />
                  <p className="font-semibold text-sm">{audioFile.name}</p>
                  <p className="text-xs text-sp-muted">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              : <>
                  <Upload size={36} className="text-sp-muted" />
                  <p className="font-semibold">Drop your audio file here</p>
                  <p className="text-sm text-sp-muted">MP3, WAV, FLAC • Max 50 MB</p>
                </>
            }
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Cover */}
            <div
              onClick={() => coverInputRef.current?.click()}
              className="glass-card aspect-square rounded-2xl flex items-center justify-center
                         cursor-pointer hover:bg-white/10 transition-all overflow-hidden col-span-1"
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCover}
                className="hidden"
              />
              {coverPreview
                ? <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2 text-sp-muted p-4">
                    <Image size={28} />
                    <span className="text-xs text-center">Add Cover</span>
                  </div>
              }
            </div>

            {/* Meta fields */}
            <div className="col-span-2 space-y-3">
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Track title *"
                required
                className="input-field"
              />
              <input
                value={form.artist}
                onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
                placeholder="Artist name *"
                required
                className="input-field"
              />
              <input
                value={form.album}
                onChange={e => setForm(f => ({ ...f, album: e.target.value }))}
                placeholder="Album (optional)"
                className="input-field"
              />
              <select
                value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                className="input-field"
              >
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <label className="text-sm text-sp-muted mb-2 block">
              Lyrics (optional — supports [timestamp] format for sync)
            </label>
            <textarea
              value={form.lyrics}
              onChange={e => setForm(f => ({ ...f, lyrics: e.target.value }))}
              rows={6}
              placeholder="[00:12.00] First line of lyrics&#10;[00:15.50] Second line..."
              className="input-field w-full resize-none font-mono text-sm"
            />
          </div>

          {/* Progress bar */}
          {status === 'uploading' && (
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-sp-green h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Feedback */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-sp-green text-sm">
              <CheckCircle2 size={16} /> Track uploaded successfully!
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'uploading'}
            className="w-full py-3 bg-sp-green text-black font-bold rounded-2xl
                       hover:bg-sp-green-alt transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2 shadow-[0_4px_20px_#1DB95466]"
          >
            {status === 'uploading'
              ? <><Loader2 size={18} className="animate-spin" /> Uploading…</>
              : <><Upload size={18} /> Upload Track</>
            }
          </button>
        </form>
      </div>

      {/* Shared input style via inline Tailwind – inject via global CSS trick */}
      <style>{`
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 10px 14px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #9CA3AF; }
        .input-field:focus { border-color: rgba(29,185,84,0.5); background: rgba(255,255,255,0.1); }
        .input-field option { background: #1A1D23; color: white; }
      `}</style>
    </div>
  );
}

// Named export wrapped in ErrorBoundary — prevents blank screen
export function UploadPageSafe(props) {
  return (
    <UploadErrorBoundary>
      <UploadPage {...props} />
    </UploadErrorBoundary>
  );
}
