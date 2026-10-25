import React, { useEffect, useState } from 'react';
import InstallPWA from '../components/InstallPWA'; // (или './InstallPWA', если они в одной папке)
import Header from '../components/Header';
import TrackGrid from '../components/TrackGrid';
import { fetchTracks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Clock, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { user }        = useAuth();
  const [recent,   setRecent]   = useState([]);
  const [trending, setTrending] = useState([]);
  const [newest,   setNewest]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTracks({ sort: 'plays',     limit: 12 }),
      fetchTracks({ sort: 'createdAt', limit: 12 }),
      fetchTracks({ sort: 'random',    limit: 12 }),
    ])
      .then(([t, n, r]) => {
        setTrending(t.data.tracks ?? []);
        setNewest(n.data.tracks ?? []);
        setRecent(r.data.tracks ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-full">
      <Header />

      {/* Hero banner */}
      <div className="px-6 pt-8 pb-6">
        <h2 className="text-3xl font-extrabold">
          {greeting},{' '}
          <span className="text-sp-green">{user?.name?.split(' ')[0]}</span>
        </h2>
        <p className="text-sp-muted mt-1">What do you want to listen to today?</p>
      </div>

      {/* Quick picks */}
      <section className="px-6 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Liked Songs',   icon: '💚', bg: 'from-sp-green/30 to-teal-900/40' },
            { label: 'Recently Played', icon: '🕐', bg: 'from-purple-900/40 to-indigo-900/40' },
            { label: 'Top Charts',    icon: '🔥', bg: 'from-orange-900/40 to-red-900/40' },
          ].map(q => (
            <div
              key={q.label}
              className={`glass-card bg-gradient-to-r ${q.bg}
                          flex items-center gap-3 p-4 cursor-pointer
                          hover:scale-[1.02] transition-transform`}
            >
              <span className="text-2xl">{q.icon}</span>
              <span className="font-semibold text-sm">{q.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <div className="flex items-center gap-2 px-6 pt-4">
        <TrendingUp size={18} className="text-sp-green" />
        <h2 className="text-xl font-bold">Trending Now</h2>
      </div>
      <TrackGrid tracks={trending} loading={loading} />

      {/* Newest uploads */}
      <div className="flex items-center gap-2 px-6 pt-4">
        <Sparkles size={18} className="text-sp-green" />
        <h2 className="text-xl font-bold">Fresh Uploads</h2>
      </div>
      <TrackGrid tracks={newest} loading={loading} />

      {/* Discover */}
      <div className="flex items-center gap-2 px-6 pt-4">
        <Clock size={18} className="text-sp-green" />
        <h2 className="text-xl font-bold">Discover</h2>
      </div>
      <TrackGrid tracks={recent} loading={loading} />
    </div>
  );
}
