import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import LyricsModal from './LyricsModal';
import EqualizerPanel from './EqualizerPanel';
import InstallPWA from './InstallPWA'; // 👈 Добавили импорт
import { usePlayer } from '../context/PlayerContext';
import { Menu } from 'lucide-react';

export default function Layout({ children }) {
  const { showLyrics, showEq } = usePlayer();
  // Mobile: sidebar is hidden by default, toggled via hamburger
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-sp-bg text-sp-text">

      {/* ── Mobile sidebar backdrop ──────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 md:static md:z-auto md:flex
          transition-transform duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar with hamburger & PWA install icon */}
        <div className="flex items-center justify-between px-4 py-3 bg-sp-bg/90 border-b border-white/5 md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center
                         text-sp-muted hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-base tracking-tight">
              SONIC<span className="text-sp-green">PULSE</span>
            </span>
          </div>

          {/* 👈 Иконка установки для мобильных устройств */}
          <InstallPWA />
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto pb-28 animate-fade-in">
          {children}
        </main>

        {/* Bottom player */}
        <PlayerBar />
      </div>

      {/* ── Global modals ───────────────────────────────────────────────── */}
      {showLyrics && <LyricsModal />}
      {showEq     && <EqualizerPanel />}
    </div>
  );
}