import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Shuffle, ListMusic, Clock } from 'lucide-react';
import Header from '../components/Header';
import { TrackList } from '../components/TrackGrid';
import { fetchPlaylist, removeFromPlaylist } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

export default function PlaylistPage() {
  const { id }             = useParams();
  const { playTrack }      = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchPlaylist(id)
      .then(({ data }) => setPlaylist(data.playlist))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleRemove = async (trackId) => {
    try {
      await removeFromPlaylist(id, trackId);
      setPlaylist(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t._id !== trackId),
      }));
    } catch {}
  };

  const totalDuration = playlist?.tracks?.reduce((s, t) => s + (t.duration ?? 0), 0) ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-2 border-sp-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sp-muted gap-3">
        <ListMusic size={48} className="opacity-20" />
        <p>Playlist not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <Header />

      {/* Hero */}
      <div className="flex gap-8 px-6 pt-8 pb-6">
        <div
          className="w-44 h-44 rounded-2xl bg-gradient-to-br from-sp-green/30 to-teal-900/50
                      flex items-center justify-center shrink-0 neon-glow"
        >
          <ListMusic size={64} className="text-sp-green opacity-60" />
        </div>
        <div className="flex flex-col justify-end gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-sp-muted">Playlist</p>
          <h1 className="text-4xl font-extrabold">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-sp-muted text-sm max-w-md">{playlist.description}</p>
          )}
          <p className="text-sm text-sp-muted">
            {playlist.tracks?.length ?? 0} songs •{' '}
            {formatTime(totalDuration)}
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => playlist.tracks?.[0] && playTrack(playlist.tracks[0], playlist.tracks)}
              className="flex items-center gap-2 px-8 py-3 bg-sp-green text-black
                         font-bold rounded-full hover:bg-sp-green-alt transition-colors
                         shadow-[0_4px_20px_#1DB95466]"
            >
              <Play size={20} fill="black" />
              Play
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white
                         font-semibold rounded-full hover:bg-white/20 transition-colors"
            >
              <Shuffle size={18} />
              Shuffle
            </button>
          </div>
        </div>
      </div>

      {/* Track list */}
      {playlist.tracks?.length > 0 ? (
        <TrackList tracks={playlist.tracks} onRemove={handleRemove} />
      ) : (
        <div className="flex flex-col items-center py-20 text-sp-muted">
          <ListMusic size={48} className="opacity-20 mb-4" />
          <p>This playlist is empty</p>
          <p className="text-sm mt-1">Search for tracks and add them here.</p>
        </div>
      )}
    </div>
  );
}
