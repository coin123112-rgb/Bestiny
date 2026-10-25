import React from 'react';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import BottomNav from './BottomNav';
import MiniPlayer from './MiniPlayer';
import LyricsModal from './LyricsModal';
import EqualizerPanel from './EqualizerPanel';
import InstallPWA from './InstallPWA';
import PWAInstallBanner from './PWAInstallBanner';
import { usePlayer } from '../context/PlayerContext';

export default function Layout({ children }) {
  const { showLyrics, showEq } = usePlayer();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-sp-bg text-sp-text">
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-sp-bg/90 border-b border-white/5 md:hidden">
          <span className="font-extrabold text-base tracking-tight" translate="no">
            <span className="text-sp-green">B</span>estiny
          </span>
          <InstallPWA />
        </div>

        <main className="flex-1 overflow-y-auto pb-[140px] md:pb-28 animate-fade-in">
          {children}
        </main>

        <div className="hidden md:block">
          <PlayerBar />
        </div>
      </div>

      <MiniPlayer />
      <BottomNav />
      <PWAInstallBanner />

      {showLyrics && <LyricsModal />}
      {showEq && <EqualizerPanel />}
    </div>
  );
}
