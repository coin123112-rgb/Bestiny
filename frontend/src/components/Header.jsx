import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Bell, X, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import InstallPWA from './InstallPWA';

// ── Notifications dropdown ────────────────────────────────────────────────
function NotificationsDropdown({ onClose }) {
  // Real app: fetch from /api/notifications — for now empty state
  const [notifs] = useState([]);
  const { t } = useI18n();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-72 bg-[#242424] border border-white/10
                 rounded-2xl shadow-2xl z-50 animate-slide-up overflow-hidden"
      role="dialog"
      aria-label={t('notifications')}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="font-semibold text-sm">{t('notifications')}</h3>
        <button onClick={onClose} className="text-sp-muted hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-sp-muted">
          <Bell size={28} className="opacity-20" />
          <p className="text-sm">{t('noNotifications')}</p>
        </div>
      ) : (
        <ul className="max-h-64 overflow-y-auto">
          {notifs.map(n => (
            <li key={n.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/5">
              <p className="text-sm">{n.text}</p>
              <p className="text-[11px] text-sp-muted mt-0.5">{n.time}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────
export default function Header({ title, subtitle }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user }   = useAuth();
  const { t }      = useI18n();
  const [q, setQ]          = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const canGoBack  = location.key !== 'default';

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 sm:gap-4
                    px-3 sm:px-6 py-3 sm:py-4
                    bg-sp-bg/80 backdrop-blur-md border-b border-white/5">

      {/* Back / Forward — desktop */}
      <div className="hidden sm:flex gap-1 shrink-0">
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
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-muted pointer-events-none" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={`${t('search')}…`}
          className="w-full bg-white/8 border border-white/10 rounded-full
                     pl-9 pr-4 py-2 text-sm text-white placeholder-sp-muted
                     focus:outline-none focus:border-sp-green/50 focus:bg-white/10 transition-all"
        />
      </form>

      {/* Page title — desktop */}
      {title && (
        <div className="flex-1 hidden md:block">
          <h1 className="text-xl font-bold truncate">{title}</h1>
          {subtitle && <p className="text-xs text-sp-muted">{subtitle}</p>}
        </div>
      )}

      {/* Mobile search icon */}
      <Link
        to="/search"
        className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full
                   bg-black/40 text-sp-muted hover:text-white transition-colors"
        aria-label={t('search')}
      >
        <Search size={17} />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto relative">
        <InstallPWA />

        {user ? (
          <>
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(v => !v)}
                className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center
                           text-sp-muted hover:text-white transition-colors"
                aria-label={t('notifications')}
                aria-expanded={showNotifs}
              >
                <Bell size={17} />
              </button>
              {showNotifs && (
                <NotificationsDropdown onClose={() => setShowNotifs(false)} />
              )}
            </div>

            {/* Avatar */}
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-sp-green to-teal-400
                         flex items-center justify-center text-black font-bold text-sm
                         hover:opacity-80 transition-opacity"
              title={t('profile')}
              aria-label={t('profile')}
            >
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                : user?.name?.[0]?.toUpperCase() ?? 'U'
              }
            </Link>
          </>
        ) : (
          /* Guest: Sign In + Register buttons */
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         text-sm font-medium text-sp-muted hover:text-white
                         border border-white/15 hover:border-white/30 transition-all"
            >
              <LogIn size={14} /> {t('signIn')}
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         bg-sp-green text-black text-sm font-bold
                         hover:bg-sp-green-alt transition-colors
                         shadow-[0_0_14px_#1DB95433]"
            >
              {t('register')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
