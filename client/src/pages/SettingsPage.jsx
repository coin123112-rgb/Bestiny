import React, { useState, useEffect } from 'react';
import {
  Bell, Palette, Globe, ShieldCheck,
  Volume2, Wifi, Trash2, ChevronRight, Moon, Sun,
} from 'lucide-react';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

// ── Helpers ───────────────────────────────────────────────────────────────
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem('bs_prefs') ?? 'null') ?? {}; }
  catch { return {}; }
}

function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200
                  ${checked ? 'bg-sp-green' : 'bg-white/15'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
                    transition-transform duration-200
                    ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SettingRow({ icon: Icon, label, description, control }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5
                    border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-sp-muted" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{label}</p>
          {description && (
            <p className="text-xs text-sp-muted mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-sp-muted mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  const [prefs, setPrefs] = useState(() => ({
    notifications:  true,
    emailUpdates:   false,
    highQuality:    true,
    autoplay:       true,
    privateSession: false,
    ...loadPrefs(),
  }));

  const [quality, setQualityState] = useState(
    () => localStorage.getItem('bs_quality') ?? 'high'
  );

  // Persist prefs to localStorage on change
  useEffect(() => {
    localStorage.setItem('bs_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const setQuality = (val) => {
    setQualityState(val);
    localStorage.setItem('bs_quality', val);
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-full">
      <Header title={t('settings')} />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* ── Playback ─────────────────────────────────────────────────── */}
        <Section title="Playback">
          <SettingRow
            icon={Volume2}
            label="High quality streaming"
            description="Uses more data but sounds better"
            control={<Toggle checked={prefs.highQuality} onChange={() => toggle('highQuality')} />}
          />
          <SettingRow
            icon={Wifi}
            label="Autoplay similar songs"
            description="Keep music going when the queue ends"
            control={<Toggle checked={prefs.autoplay} onChange={() => toggle('autoplay')} />}
          />
          <SettingRow
            icon={Volume2}
            label="Audio quality"
            description="Choose streaming bitrate"
            control={
              <select
                value={quality}
                onChange={e => setQuality(e.target.value)}
                className="bg-sp-surface border border-white/10 rounded-lg px-3 py-1.5
                           text-sm text-white focus:outline-none focus:border-sp-green/50"
              >
                <option value="low">Low (96 kbps)</option>
                <option value="normal">Normal (160 kbps)</option>
                <option value="high">High (320 kbps)</option>
              </select>
            }
          />
        </Section>

        {/* ── Notifications ─────────────────────────────────────────────── */}
        <Section title={t('notifications')}>
          <SettingRow
            icon={Bell}
            label="Push notifications"
            description="New releases and activity alerts"
            control={<Toggle checked={prefs.notifications} onChange={() => toggle('notifications')} />}
          />
          <SettingRow
            icon={Bell}
            label="Email updates"
            description="Weekly digest and recommendations"
            control={<Toggle checked={prefs.emailUpdates} onChange={() => toggle('emailUpdates')} />}
          />
        </Section>

        {/* ── Privacy ───────────────────────────────────────────────────── */}
        <Section title="Privacy & Security">
          <SettingRow
            icon={ShieldCheck}
            label="Private session"
            description="Don't show what you're listening to"
            control={<Toggle checked={prefs.privateSession} onChange={() => toggle('privateSession')} />}
          />
          <SettingRow
            icon={Globe}
            label="Language"
            description="Interface language — saved automatically"
            control={
              <select
                value={locale}
                onChange={e => setLocale(e.target.value)}
                className="bg-sp-surface border border-white/10 rounded-lg px-3 py-1.5
                           text-sm text-white focus:outline-none focus:border-sp-green/50"
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
              </select>
            }
          />
        </Section>

        {/* ── Appearance ────────────────────────────────────────────────── */}
        <Section title="Appearance">
          <SettingRow
            icon={isDark ? Moon : Sun}
            label={isDark ? 'Dark mode' : 'Light mode'}
            description="Changes the look of the entire app"
            control={
              <Toggle
                checked={isDark}
                onChange={toggleTheme}
              />
            }
          />
        </Section>

        {/* ── Danger zone ───────────────────────────────────────────────── */}
        <Section title="Danger Zone">
          <SettingRow
            icon={Trash2}
            label="Delete account"
            description="Permanently remove your account and all data"
            control={
              <button
                onClick={() => alert('Account deletion is not yet implemented.')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
              >
                Delete <ChevronRight size={13} />
              </button>
            }
          />
        </Section>

        <p className="text-center text-xs text-sp-muted pb-4" translate="no">
          Bestiny v1.0.0
        </p>
      </div>
    </div>
  );
}
