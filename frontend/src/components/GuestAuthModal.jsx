import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Music2 } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

/**
 * Modal shown when a guest tries to perform an auth-required action.
 * Props:
 *   onClose()         — close the modal
 *   onContinue()      — "Позже" — close and allow the action anyway (guest playback)
 */
export default function GuestAuthModal({ onClose, onContinue }) {
  const navigate = useNavigate();
  const { t } = useI18n();

  // Close on Escape
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4
                 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#242424] border border-white/10
                   rounded-2xl p-8 shadow-2xl animate-slide-up text-center"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-modal-title"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sp-muted hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-sp-green/10 border border-sp-green/20
                        flex items-center justify-center mx-auto mb-6">
          <Music2 size={30} className="text-sp-green" />
        </div>

        {/* Text */}
        <h2
          id="guest-modal-title"
          className="text-xl font-bold text-white mb-2"
          translate="no"
        >
          {t('guestModal.title')}
        </h2>
        <p className="text-sp-muted text-sm leading-relaxed mb-7">
          {t('guestModal.body')}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onClose(); navigate('/login'); }}
            className="w-full py-3 bg-sp-green text-black font-bold rounded-xl
                       hover:bg-sp-green-alt transition-colors
                       shadow-[0_4px_20px_#1DB95466]"
          >
            {t('guestModal.signIn')}
          </button>

          <button
            onClick={() => { onClose(); navigate('/register'); }}
            className="w-full py-3 bg-white/10 text-white font-semibold rounded-xl
                       hover:bg-white/15 transition-colors border border-white/10"
          >
            {t('guestModal.register')}
          </button>

          <button
            onClick={() => {
              onClose();
              onContinue?.();
            }}
            className="text-sp-muted text-sm hover:text-white transition-colors py-1"
          >
            {t('guestModal.later')}
          </button>
        </div>
      </div>
    </div>
  );
}
