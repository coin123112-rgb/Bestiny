import React, { useState } from 'react';
import { User, Mail, Edit3, CheckCircle2, LogOut, Upload } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [editMode,  setEditMode]  = useState(false);
  const [name,      setName]      = useState(user?.name ?? '');
  const [saved,     setSaved]     = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: call PATCH /api/auth/me with updated name
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-full">
      <Header title="Profile" />

      <div className="max-w-lg mx-auto px-4 py-10 space-y-6">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sp-green to-teal-400
                            flex items-center justify-center text-black font-extrabold text-3xl
                            neon-glow">
              {initials}
            </div>
            <button
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sp-green
                         flex items-center justify-center text-black
                         hover:bg-sp-green-alt transition-colors"
              title="Change avatar (coming soon)"
            >
              <Upload size={14} />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sp-muted text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-sp-muted">
              Account info
            </h3>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-xs text-sp-green hover:underline"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs text-sp-muted mb-1.5">Display name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-muted" />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={!editMode}
                  className="w-full bg-sp-surface border border-white/10 rounded-xl
                             pl-9 pr-4 py-2.5 text-sm text-white
                             disabled:opacity-60 disabled:cursor-default
                             focus:outline-none focus:border-sp-green/50 transition-all
                             caret-sp-green"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs text-sp-muted mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-muted" />
                <input
                  value={user?.email ?? ''}
                  disabled
                  readOnly
                  className="w-full bg-sp-surface border border-white/10 rounded-xl
                             pl-9 pr-4 py-2.5 text-sm text-white
                             opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            {editMode && (
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setEditMode(false); setName(user?.name ?? ''); }}
                  className="flex-1 py-2.5 rounded-xl bg-white/8 text-sp-muted text-sm
                             hover:bg-white/12 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sp-green text-black text-sm font-bold
                             hover:bg-sp-green-alt transition-colors"
                >
                  Save changes
                </button>
              </div>
            )}
          </form>

          {saved && (
            <div className="flex items-center gap-2 text-sp-green text-sm">
              <CheckCircle2 size={15} /> Profile updated!
            </div>
          )}
        </div>

        {/* Stats placeholder */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-sm uppercase tracking-widest text-sp-muted mb-4">
            Your stats
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Tracks liked',   value: user?.likedTracks?.length ?? '—' },
              { label: 'Playlists',      value: '—' },
              { label: 'Hours listened', value: '—' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-xl font-bold text-sp-green">{stat.value}</p>
                <p className="text-[11px] text-sp-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                     border border-red-500/30 text-red-400 hover:bg-red-500/10
                     text-sm font-medium transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}
