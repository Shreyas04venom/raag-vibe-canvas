import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import TrackCard from '@/components/TrackCard';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchMusic, GENRES } from '@/services/music.service';
import type { Track } from '@/types/track';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') ?? '';
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('rw:recent-searches') ?? '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchMusic(q, 30);
      setResults(r); setLoading(false);
      setParams({ q }, { replace: true });
      setRecent((cur) => {
        const n = [q, ...cur.filter((c) => c !== q)].slice(0, 8);
        localStorage.setItem('rw:recent-searches', JSON.stringify(n));
        return n;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => { if (initial) setQ(initial); }, [initial]);

  return (
    <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
      <Navigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Search</h1>
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Songs, artists, albums..."
            className="pl-12 pr-12 h-14 text-base glass border-white/10"
          />
          {q && (
            <button onClick={() => { setQ(''); setResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {!q && (
          <>
            {recent.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Recent searches</h2>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <Button key={r} variant="outline" size="sm" onClick={() => setQ(r)} className="rounded-full">{r}</Button>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-lg font-semibold mb-3">Browse categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GENRES.map((g) => (
                  <motion.button
                    key={g.id} whileHover={{ scale: 1.03 }}
                    onClick={() => setQ(g.query)}
                    className={`aspect-square rounded-2xl bg-gradient-to-br ${g.gradient} p-4 flex items-end text-left shadow-lg`}
                  >
                    <span className="text-xl font-bold text-white drop-shadow">{g.name}</span>
                  </motion.button>
                ))}
              </div>
            </section>
          </>
        )}

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((t) => <TrackCard key={t.id} track={t} queue={results} />)}
          </div>
        )}

        {!loading && q && results.length === 0 && (
          <p className="text-center text-muted-foreground py-16">No results for "{q}"</p>
        )}
      </main>
    </div>
  );
}
