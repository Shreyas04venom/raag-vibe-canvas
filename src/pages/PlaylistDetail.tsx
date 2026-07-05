import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import TrackCard from '@/components/TrackCard';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import type { Track } from '@/types/track';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft, Music2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/app-client';

export default function PlaylistDetail() {
  const { id } = useParams();
  const { playlistTracks, playlists, removeFromPlaylist } = useLibrary();
  const { play } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [meta, setMeta] = useState<any>(null);

  const load = async () => {
    if (!id) return;
    const t = await playlistTracks(id);
    setTracks(t);
    const local = playlists.find((p) => p.id === id);
    if (local) setMeta(local);
    else {
      const { data } = await supabase.from('playlists').select('*').eq('id', id).maybeSingle();
      setMeta(data);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  return (
    <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
      <Navigation />
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        <Link to="/library" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-4 h-4" />Back to library</Link>
        <div className="flex items-end gap-6 mb-8">
          <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center shadow-2xl">
            <Music2 className="w-20 h-20 text-white/70" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Playlist</p>
            <h1 className="text-3xl md:text-5xl font-bold gradient-text">{meta?.name ?? 'Playlist'}</h1>
            {meta?.description && <p className="text-muted-foreground mt-2">{meta.description}</p>}
            <p className="text-sm text-muted-foreground mt-1">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>
            <Button className="mt-4 gap-2" onClick={() => tracks[0] && play(tracks[0], tracks)} disabled={!tracks.length}>
              <Play className="w-4 h-4 fill-current" />Play all
            </Button>
          </div>
        </div>
        {tracks.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">This playlist is empty. Add songs from search or home.</p>
        ) : (
          <div className="space-y-1">
            {tracks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 group">
                <div className="flex-1"><TrackCard track={t} queue={tracks} compact /></div>
                <Button size="sm" variant="ghost" onClick={() => { removeFromPlaylist(id!, t.id).then(load); }}>Remove</Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
