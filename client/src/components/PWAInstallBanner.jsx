import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible,        setVisible]        = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('pwa_dismissed');
      if (!dismissed) setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('pwa_dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50
                 glass-card flex items-center gap-4 px-5 py-3
                 shadow-[0_8px_40px_#1DB95433] animate-slide-up
                 border border-sp-green/30"
      role="alertdialog"
      aria-label="Install Bestiny"
    >
      <div className="w-9 h-9 rounded-xl bg-sp-green flex items-center justify-center text-black shrink-0">
        <Download size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold">Install Bestiny</p>
        <p className="text-xs text-sp-muted">Add to home screen for the best experience</p>
      </div>
      <button
        onClick={handleInstall}
        className="ml-2 px-4 py-1.5 bg-sp-green text-black text-sm font-bold
                   rounded-full hover:bg-sp-green-alt transition-colors shrink-0"
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        className="text-sp-muted hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
