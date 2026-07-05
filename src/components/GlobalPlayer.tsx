import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Play, Pause, SkipBack, SkipForward, Heart, ListMusic, ChevronUp, Volume2, VolumeX, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FullPlayerSheet from './FullPlayerSheet';

function fmt(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60); const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function GlobalPlayer() {
  const p = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [expanded, setExpanded] = useState(false);
  const loc = useLocation();
  if (!p.current) return null;
  if (loc.pathname === '/') return null;

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 md:left-64"
      >
        <div className="mx-2 md:mx-0 glass border-t border-white/10 rounded-2xl md:rounded-none px-3 py-2 md:px-6 md:py-3">
          {/* progress */}
          <div className="hidden md:block mb-2">
            <Slider
              value={[p.progress]}
              max={p.duration || 30}
              step={0.1}
              onValueChange={([v]) => p.seek(v)}
              className="cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-64" onClick={() => setExpanded(true)}>
              <img src={p.current.image} alt="" className="w-11 h-11 rounded-md object-cover" />
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium truncate">{p.current.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.current.artist}</p>
              </div>
            </button>

            <div className="flex items-center gap-1 md:gap-2 md:flex-1 md:justify-center">
              <Button size="icon" variant="ghost" className="hidden md:flex" onClick={p.toggleShuffle}>
                <Shuffle className={`w-4 h-4 ${p.shuffle ? 'text-primary' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" onClick={p.prev}><SkipBack className="w-5 h-5" /></Button>
              <Button size="icon" onClick={p.toggle} className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10">
                {p.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={p.next}><SkipForward className="w-5 h-5" /></Button>
              <Button size="icon" variant="ghost" className="hidden md:flex" onClick={p.cycleRepeat}>
                {p.repeat === 'one' ? <Repeat1 className="w-4 h-4 text-primary" /> : <Repeat className={`w-4 h-4 ${p.repeat === 'all' ? 'text-primary' : ''}`} />}
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-2 w-64 justify-end">
              <span className="text-xs text-muted-foreground tabular-nums">{fmt(p.progress)} / {fmt(p.duration)}</span>
              <Button size="icon" variant="ghost" onClick={() => toggleFavorite(p.current!)}>
                <Heart className={`w-4 h-4 ${isFavorite(p.current.id) ? 'fill-accent text-accent' : ''}`} />
              </Button>
              <Link to="/queue"><Button size="icon" variant="ghost"><ListMusic className="w-4 h-4" /></Button></Link>
              <Button size="icon" variant="ghost" onClick={p.toggleMute}>
                {p.muted || p.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <div className="w-20"><Slider value={[p.muted ? 0 : p.volume * 100]} max={100} onValueChange={([v]) => p.setVolume(v / 100)} /></div>
            </div>

            <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setExpanded(true)}>
              <ChevronUp className="w-5 h-5" />
            </Button>
          </div>
          {/* mobile progress */}
          <div className="md:hidden mt-1">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(p.progress / (p.duration || 30)) * 100}%` }} />
            </div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {expanded && <FullPlayerSheet onClose={() => setExpanded(false)} />}
      </AnimatePresence>
    </>
  );
}
