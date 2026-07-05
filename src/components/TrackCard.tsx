import { Track } from '@/types/track';
import { Heart, Play, MoreVertical, Plus, Radio, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Props {
  track: Track;
  queue?: Track[];
  compact?: boolean;
}

export default function TrackCard({ track, queue, compact }: Props) {
  const { play, addToQueue, playNext, startRadio, current, isPlaying } = usePlayer();
  const { isFavorite, toggleFavorite, playlists, addToPlaylist } = useLibrary();
  const isCurrent = current?.id === track.id;
  const liked = isFavorite(track.id);

  if (compact) {
    return (
      <div
        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer"
        onClick={() => play(track, queue)}
      >
        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
          {track.image && <img src={track.image} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <Play className="w-5 h-5 fill-white" />
          </div>
          {isCurrent && isPlaying && <EqBars />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{track.name}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-accent text-accent' : ''}`} />
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-hover rounded-2xl p-3 group cursor-pointer"
      onClick={() => play(track, queue)}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-muted">
        {track.image ? (
          <img src={track.image} alt={track.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
        {isCurrent && isPlaying && (
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur rounded-full p-1.5"><EqBars /></div>
        )}
        <Button
          size="icon"
          className="absolute bottom-2 right-2 rounded-full bg-primary hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition shadow-xl"
          onClick={(e) => { e.stopPropagation(); play(track, queue); }}
        >
          <Play className="w-5 h-5 fill-white" />
        </Button>
      </div>
      <div className="px-1 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{track.name}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>
        <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleFavorite(track)}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-accent text-accent' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => playNext(track)}>Play next</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addToQueue(track)}>Add to queue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => startRadio(track)}><Radio className="w-3 h-3 mr-2" />Start radio</DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                const url = track.videoId ? `https://youtu.be/${track.videoId}` : window.location.href;
                try { if (navigator.share) await navigator.share({ title: track.name, text: `${track.name} — ${track.artist}`, url }); else { await navigator.clipboard.writeText(url); toast.success('Link copied'); } } catch {}
              }}><Share2 className="w-3 h-3 mr-2" />Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              {playlists.length === 0 && <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>}
              {playlists.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => addToPlaylist(p.id, track)}>
                  <Plus className="w-3 h-3 mr-2" />{p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

function EqBars() {
  return (
    <div className="flex items-end gap-0.5 h-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-0.5 bg-primary rounded-sm animate-eq"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}
