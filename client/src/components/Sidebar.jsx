import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Home, Search, Library, Music2, ListMusic, Heart,
  PlusSquare, Settings, LogOut, ChevronRight, X,
  Loader2, AlertCircle, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPlaylists, createPlaylist } from '../services/api';

// ── PWA Install Component ─────────────────────────────────────────────────
function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Пользователь установил приложение');
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                 bg-sp-green/10 text-sp-green hover:bg-sp-green/20 transition-all border border-sp-green/20"
    >
      <Download size={18} className="shrink-0" />
      <span className="truncate">Install App</span>
    </button>
  );
}

// ── Custom "Create Playlist" modal ────────────────────────────────────────
function CreatePlaylistModal({ onClose, onCreate }) {
  const [name,    setName]    = useState('');
  const [desc,    setDesc]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const inputRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter a playlist name'); return; }
    setLoading(true);
    setError('');
    try {
      await onCreate(name.trim(), desc.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create playlist');
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — stop click propagation so backdrop click doesn't close via children */}
      <div
        className="w-full max-w-sm bg-[#242424] border border-white/10 p-6 rounded-2xl shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="playlist-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 id="playlist-modal-title" className="text-lg font-bold text-white">
            Create Playlist
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                       text-sp-muted hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-sp-muted mb-1.5" htmlFor="pl-name">
              Playlist name <span className="text-red-400">*</span>
            </label>
            <input
              id="pl-name"
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
              placeholder="My awesome playlist"
              className="w-full bg-[#121212] border border-white/10 rounded-xl
                         px-4 py-2.5 text-sm text-white placeholder-sp-muted
                         focus:outline-none focus:border-sp-green/50 transition-all"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm text-sp-muted mb-1.5" htmlFor="pl-desc">
              Description <span className="text-sp-muted/50">(optional)</span>
            </label>
            <textarea
              id="pl-desc"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="What's this playlist about?"
              className="w-full resize-none bg-[#121212] border border-white/10 rounded-xl
                         px-4 py-2.5 text-sm text-white placeholder-sp-muted
                         focus:outline-none focus:border-sp-green/50 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/8 text-sp-muted text-sm font-medium
                         hover:bg-white/12 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-sp-green text-black text-sm font-bold
                         hover:bg-sp-green-alt transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Creating…</>
                : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [playlists,   setPlaylists]   = useState([]);
  const [collapsed,   setCollapsed]   = useState(false);
  const [showModal,   setShowModal]   = useState(false);

  useEffect(() => {
    fetchPlaylists()
      .then(({ data }) => setPlaylists(data.playlists ?? []))
      .catch(() => {});
  }, []);

  const handleCreatePlaylist = async (name, description) => {
    const { data } = await createPlaylist({ name, description });
    setPlaylists(prev => [data.playlist, ...prev]);
    navigate(`/playlist/${data.playlist._id}`);
  };

  // Helper: close mobile sidebar after navigation
  const handleNavClick = () => { onClose?.(); };

  const navCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
     ${isActive
       ? 'bg-white/10 text-white'
       : 'text-sp-muted hover:text-white hover:bg-white/5'}`;

  return (
    <>
      <aside
        className={`flex flex-col h-full bg-black/60 backdrop-blur-md border-r border-white/5
                    transition-all duration-300 ease-in-out shrink-0
                    ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
      >
        {/* ── Logo (clickable → home) ─────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-5">
          <Link
            to="/"
            onClick={handleNavClick}
            className="w-9 h-9 rounded-xl bg-sp-green flex items-center justify-center
                       shrink-0 neon-glow hover:opacity-90 transition-opacity"
            aria-label="Go to home"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
              <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm4.1 13c-.17.28-.54.36-.82.2-2.26-1.38-5.1-1.69-8.44-.93-.32.07-.64-.13-.71-.45-.07-.32.12-.64.44-.71
                        3.63-.83 6.74-.47 9.27 1.07.28.17.36.55.19.82zm1.1-2.44c-.21.35-.66.46-1 .25-2.58-1.59-6.52-2.05-9.57-1.12-.4.12-.81-.1-.93-.5-.12-.4.1-.81.5-.93
                        3.49-1.06 7.83-.54 10.8 1.28.34.2.45.66.24 1zm.09-2.54c-3.1-1.84-8.22-2.01-11.18-1.11-.47.14-.97-.12-1.11-.59-.14-.47.12-.97.59-1.11
                        3.4-1.03 9.06-.83 12.63 1.28.42.25.56.79.31 1.21-.25.42-.79.56-1.22.31z"/>
            </svg>
          </Link>

          {!collapsed && (
            <Link
              to="/"
              onClick={handleNavClick}
              className="font-extrabold text-lg tracking-tight leading-none
                         hover:opacity-80 transition-opacity text-white"
            >
              SONIC<span className="text-sp-green">PULSE</span>
            </Link>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto text-sp-muted hover:text-white transition-colors hidden md:flex"
            aria-label="Toggle sidebar"
          >
            <ChevronRight
              size={16}
              className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
            />
          </button>

          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto text-sp-muted hover:text-white transition-colors md:hidden"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── Primary Nav ─────────────────────────────────────────────── */}
        <nav className="px-3 space-y-1" onClick={handleNavClick}>
          <NavLink to="/"    end className={navCls}>
            <Home size={20} /> {!collapsed && 'Home'}
          </NavLink>
          <NavLink to="/search"   className={navCls}>
            <Search size={20} /> {!collapsed && 'Search'}
          </NavLink>
          <NavLink to="/library"   className={navCls}>
            <Library size={20} /> {!collapsed && 'Your Library'}
          </NavLink>
        </nav>

        <div className="mx-4 my-4 border-t border-white/5" />

        {/* ── Playlists section ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {!collapsed && (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-sp-muted">
              Playlists
            </p>
          )}

          <NavLink to="/library?tab=liked" className={navCls} onClick={handleNavClick}>
            <Heart size={18} className="text-sp-green shrink-0" />
            {!collapsed && 'Liked Songs'}
          </NavLink>

          {playlists.map(pl => (
            <NavLink
              key={pl._id}
              to={`/playlist/${pl._id}`}
              className={navCls}
              onClick={handleNavClick}
            >
              <ListMusic size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{pl.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* ── Bottom actions (including PWA Install button) ────────────── */}
        <div className="px-3 pb-3 space-y-1 border-t border-white/5 pt-3">
          {!collapsed && <InstallPWA />}
          
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                       text-sp-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <PlusSquare size={18} className="shrink-0" />
            {!collapsed && 'Create Playlist'}
          </button>
          <NavLink to="/upload" className={navCls} onClick={handleNavClick}>
            <Music2 size={18} className="shrink-0" />
            {!collapsed && 'Upload Track'}
          </NavLink>
          <NavLink to="/settings" className={navCls} onClick={handleNavClick}>
            <Settings size={18} className="shrink-0" />
            {!collapsed && 'Settings'}
          </NavLink>
        </div>

        {/* ── User profile (clickable → /profile) ─────────────────────── */}
        <div className="border-t border-white/5">
          <Link
            to="/profile"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            title="View profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sp-green to-teal-400
                            flex items-center justify-center text-black font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                <p className="text-xs text-sp-muted truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); logout(); }}
                className="text-sp-muted hover:text-red-400 transition-colors shrink-0"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            )}
          </Link>
        </div>
      </aside>

      {/* ── Create playlist modal ────────────────────────────────-------- */}
      {showModal && (
        <CreatePlaylistModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreatePlaylist}
        />
      )}
    </>
  );
}