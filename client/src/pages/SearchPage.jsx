import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import TrackGrid from '../components/TrackGrid';
import { searchAll } from '../services/api';

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [params]     = useSearchParams();
  const [query,  setQuery]  = useState(params.get('q') ?? '');
  const [results, setResults] = useState({ tracks: [], albums: [], artists: [] });
  const [loading, setLoading] = useState(false);

  const debounced = useDebounce(query);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults({ tracks: [], albums: [], artists: [] }); return; }
    setLoading(true);
    try {
      const { data } = await searchAll(q);
      setResults(data);
    } catch {
      setResults({ tracks: [], albums: [], artists: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch(debounced); }, [debounced, doSearch]);

  const hasResults = results.tracks.length > 0;

  return (
    <div className="min-h-full">
      <Header />

      <div className="px-6 pt-8 pb-4">
        <h2 className="text-3xl font-extrabold mb-5">Search</h2>

        {/* Standalone search box */}
        <div className="relative max-w-lg">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sp-muted"
          />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="What do you want to hear?"
            className="w-full bg-white/8 border border-white/10 rounded-2xl
                       pl-12 pr-4 py-3 text-base text-white placeholder-sp-muted
                       focus:outline-none focus:border-sp-green/50 focus:bg-white/10
                       transition-all"
          />
          {loading && (
            <Loader2
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sp-green animate-spin"
            />
          )}
        </div>
      </div>

      {/* Results */}
      {!debounced.trim() && (
        <div className="px-6">
          <p className="text-sp-muted text-sm">Start typing to search…</p>
        </div>
      )}

      {debounced.trim() && !loading && !hasResults && (
        <div className="flex flex-col items-center py-20 text-sp-muted">
          <SearchIcon size={48} className="opacity-20 mb-4" />
          <p className="text-lg">No results for "{debounced}"</p>
          <p className="text-sm mt-1">Try different keywords or check your spelling.</p>
        </div>
      )}

      {hasResults && (
        <TrackGrid
          tracks={results.tracks}
          title={`Results for "${debounced}"`}
          subtitle={`${results.tracks.length} tracks found`}
          loading={loading}
        />
      )}
    </div>
  );
}
