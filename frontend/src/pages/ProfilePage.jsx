import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Edit3, CheckCircle2, LogOut, Upload } from 'lucide-react';
import Header from '../components/Header';
import TrackGrid from '../components/TrackGrid';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import API from '../services/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { locale } = useI18n();
  const fileInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('bs_avatar') || user?.avatarUrl || '');
  
  // Стейт для треков пользователя
  const [myTracks, setMyTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  useEffect(() => {
    const nextAvatar = localStorage.getItem('bs_avatar') || user?.avatarUrl || '';
    setAvatarUrl(nextAvatar);
  }, [user]);

  // Загружаем треки и фильтруем те, которые загрузил текущий пользователь
  useEffect(() => {
    API.get('/tracks')
      .then(res => {
        const allTracks = res.data.tracks || res.data;
        if (Array.isArray(allTracks) && user?._id) {
          const userSongs = allTracks.filter(track => {
            const ownerId = track.uploadedBy?._id ?? track.uploadedBy;
            return String(ownerId) === String(user._id);
          });
          setMyTracks(userSongs);
        }
      })
      .catch(err => console.error('Error loading user tracks:', err))
      .finally(() => setLoadingTracks(false));
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextValue = String(reader.result || '');
      localStorage.setItem('bs_avatar', nextValue);
      setAvatarUrl(nextValue);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSave = (e) => {
    e.preventDefault();
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const uploadText = locale === 'ru' ? 'Загрузить' : 'Upload';

  return (
    <div className="min-h-full pb-10">
      <Header title="Profile" />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="max-w-lg mx-auto space-y-6 w-full">
          <div className="flex flex-col items-center gap-4">
            <div
              className="group relative overflow-hidden cursor-pointer w-24 h-24 rounded-full bg-gradient-to-br from-sp-green to-teal-400 flex items-center justify-center text-black font-extrabold text-3xl neon-glow"
              onClick={handleAvatarClick}
              title="Change avatar"
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleAvatarClick();
                }
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                <Upload size={14} />
                <span className="text-[10px] font-medium uppercase tracking-wide">{uploadText}</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />

            <div className="text-center">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-sp-muted text-sm mt-0.5">{user?.email}</p>
            </div>
          </div>

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
              <div>
                <label className="block text-xs text-sp-muted mb-1.5">Display name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-muted" />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={!editMode}
                    className="w-full bg-sp-surface border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white disabled:opacity-60 disabled:cursor-default focus:outline-none focus:border-sp-green/50 transition-all caret-sp-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-sp-muted mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-muted" />
                  <input
                    value={user?.email ?? ''}
                    disabled
                    readOnly
                    className="w-full bg-sp-surface border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {editMode && (
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setEditMode(false); setName(user?.name ?? ''); }}
                    className="flex-1 py-2.5 rounded-xl bg-white/8 text-sp-muted text-sm hover:bg-white/12 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-sp-green text-black text-sm font-bold hover:bg-sp-green-alt transition-colors"
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

          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-sp-muted mb-4">
              Your stats
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Tracks liked', value: user?.likedTracks?.length ?? '—' },
                { label: 'My Uploads', value: myTracks.length },
                { label: 'Hours listened', value: '—' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xl font-bold text-sp-green">{stat.value}</p>
                  <p className="text-[11px] text-sp-muted mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {/* Секция загруженных треков с поддержкой редактирования и удаления */}
        <div className="border-t border-white/10 pt-6">
          <TrackGrid
            tracks={myTracks}
            title="Мои загруженные треки"
            subtitle="Здесь вы можете управлять своими песнями (редактировать или удалять)"
            loading={loadingTracks}
            editable={true}
            onTrackDeleted={(deletedId) => {
              setMyTracks(prev => prev.filter(t => t._id !== deletedId));
            }}
            onTrackUpdated={(updatedTrack) => {
              setMyTracks(prev => prev.map(t => t._id === updatedTrack._id ? updatedTrack : t));
            }}
          />
        </div>
      </div>
    </div>
  );
}