import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ListMusic, Heart, Music2 } from 'lucide-react';
import Header from '../components/Header';
import TrackGrid from '../components/TrackGrid';
import { fetchTracks, fetchPlaylists } from '../services/api';

const TABS = ['All', 'Liked', 'Playlists', 'Uploaded'];

export default function LibraryPage() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const defaultTab      = searchParams.get('tab') === 'liked' ? 'Liked' : 'All';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [tracks,    setTracks]    = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const params =
      activeTab === 'Liked'    ? { liked: true } :
      activeTab === 'Uploaded' ? { myUploads: true } : {};

    if (activeTab === 'Playlists') {
      fetchPlaylists()
        .then(({ data }) => setPlaylists(data.playlists ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      fetchTracks(params)
        .then(({ data }) => setTracks(data.tracks ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="min-h-full">
      <Header title="Your Library" />

      {/* Tab bar */}
      <div className="flex gap-2 px-6 pt-6 pb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                        ${activeTab === tab
                          ? 'bg-sp-green text-black'
                          : 'bg-white/10 text-sp-muted hover:text-white hover:bg-white/15'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Playlists grid */}
      {activeTab === 'Playlists' && (
        <div className="px-6 pb-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse h-28" />
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-sp-muted">
              <ListMusic size={48} className="opacity-20 mb-4" />
              <p>No playlists yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {playlists.map(pl => (
                <div
                  key={pl._id}
                  onClick={() => navigate(`/playlist/${pl._id}`)}
                  className="glass-card p-4 cursor-pointer hover:bg-white/10
                             transition-all hover:scale-[1.02]"
                >
                  <div className="w-full aspect-square rounded-xl bg-gradient-to-br
                                  from-sp-green/20 to-teal-900/30 flex items-center justify-center mb-3">
                    <ListMusic size={32} className="text-sp-green opacity-60" />
                  </div>
                  <p className="font-semibold text-sm truncate">{pl.name}</p>
                  <p className="text-xs text-sp-muted mt-0.5">
                    {pl.tracks?.length ?? 0} tracks
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tracks */}
      {activeTab !== 'Playlists' && (
        <TrackGrid
          tracks={tracks}
          loading={loading}
          title={
            activeTab === 'Liked'    ? '❤️ Liked Songs' :
            activeTab === 'Uploaded' ? '📤 Your Uploads' : '🎵 All Tracks'
          }
          subtitle={loading ? '' : `${tracks.length} tracks`}
        />
      )}
    </div>
  );
}
