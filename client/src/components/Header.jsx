import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InstallPWA from './InstallPWA'; // 👈 Подключили компонент кнопки установки

// ── Notifications dropdown ────────────────────────────────────────────────
const SAMPLE_NOTIFS = [
  { id: 1, text: 'Your track "Midnight Drift" was liked',  time: '2m ago',  read: false },
  { id: 2, text: 'New song added to your playlist',        time: '1h ago',  read: false },
  { id: 3, text: 'Welcome to Bestiny! 🎵',                 time: '2d ago',  read: true  },
];

function NotificationsDropdown({ onClose }) {
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const markAllRead = () =>
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 glass-card shadow-2xl z-50
                 border border-white/10 animate-slide-up overflow-hidden"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-sp-green
                             text-black rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-sp-green hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-sp-muted hover:text-white transition-colors"
            aria-label="Close notifications"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Items */}
      <ul className="max-h-72 overflow-y-auto">
        {notifs.map(n => (
          <li
            key={n.id}
            className={`flex gap-3 px-4 py-3 border-b border-white/5 last:border-0
                        hover:bg-white/5 transition-colors cursor-pointer
                        ${!n.read ? 'bg-sp-green/5' : ''}`}
            onClick={() => setNotifs(prev =>
              prev.map(x => x.id === n.id ? { ...x, read: true } : x)
            )}
          >
            {/* Unread dot */}
            <div className="mt-1.5 shrink-0">
              <div className={`w-2 h-2 rounded-full transition-colors
                              ${!n.read ? 'bg-sp-green' : 'bg-transparent'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white leading-snug">{n.text}</p>
              <p className="text-[11px] text-sp-muted mt-0.5">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/5">
        <button className="w-full text-center text-xs text-sp-muted hover:text-white transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  );
}

// ── Header component ──────────────────────────────────────────────────────
export default function Header({ title, subtitle }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user }   = useAuth();
  const [q, setQ]          = useState('');
  const [showNotifs, setShowNotifs] = useState(false);

  // Only go back if there's actual history — prevents blank-page trap
  const canGoBack = location.key !== 'default';

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4
                    bg-sp-bg/80 backdrop-blur-md border-b border-white/5">

      {/* Back / Forward */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => { if (canGoBack) navigate(-1); }}
          disabled={!canGoBack}
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center
                     text-sp-muted hover:text-white transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Go back"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center
                     text-sp-muted hover:text-white transition-colors"
          aria-label="Go forward"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex-1 max-w-md relative hidden sm:block"
      >
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-muted pointer-events-none"
        />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Artists, tracks, albums…"
          className="w-full bg-white/8 border border-white/10 rounded-full
                     pl-9 pr-4 py-2 text-sm text-white placeholder-sp-muted
                     focus:outline-none focus:border-sp-green/50 focus:bg-white/10
                     transition-all"
        />
      </form>

      {/* Page title */}
      {title && (
        <div className="flex-1 hidden md:block">
          <h1 className="text-xl font-bold truncate">{title}</h1>
          {subtitle && <p className="text-xs text-sp-muted">{subtitle}</p>}
        </div>
      )}

      {/* Mobile search button */}
      <Link
        to="/search"
        className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full
                   bg-black/40 text-sp-muted hover:text-white transition-colors"
        aria-label="Search"
      >
        <Search size={17} />
      </Link>

      {/* Right side: PWA Install + Notifications + Avatar */}
      <div className="flex items-center gap-2 ml-auto relative">
        
        {/* 👈 Кнопка/Иконка установки PWA */}
        <InstallPWA />

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center
                       text-sp-muted hover:text-white transition-colors"
            aria-label="Notifications"
            aria-expanded={showNotifs}
          >
            <Bell size={17} />
            {SAMPLE_NOTIFS.some(n => !n.read) && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-sp-green rounded-full
                               border border-sp-bg" />
            )}
          </button>

          {showNotifs && (
            <NotificationsDropdown onClose={() => setShowNotifs(false)} />
          )}
        </div>

        {/* Avatar → profile page */}
        <Link
          to="/profile"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-sp-green to-teal-400
                     flex items-center justify-center text-black font-bold text-sm
                     hover:opacity-80 transition-opacity ring-2 ring-transparent
                     hover:ring-sp-green"
          title="View profile"
          aria-label="View profile"
        >
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
            : user?.name?.[0]?.toUpperCase() ?? 'U'
          }
        </Link>
      </div>
    </div>
  );
}