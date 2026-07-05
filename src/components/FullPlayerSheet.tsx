import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, X, Heart, Volume2, VolumeX, Shuffle, Repeat, Repeat1, ListMusic, FileText, Radio, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEffect, useState } from 'react';
import { getLyrics } from '@/services/music.service';

function fmt(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60); const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function FullPlayerSheet({ onClose }: { onClose: () => void }) {
  const p = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string>('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  useEffect(() => {
    if (showLyrics && p.current) {
      setLoadingLyrics(true);
      getLyrics(p.current.artist, p.current.name).then((l) => {
        setLyrics(l || 'Lyrics not available for this track.');
        setLoadingLyrics(false);
      });
    }
  }, [showLyrics, p.current]);

  if (!p.current) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-background via-primary/20 to-accent/20 backdrop-blur-xl overflow-y-auto"
    >
      <div className="min-h-full flex flex-col p-6 md:p-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-6 h-6" /></Button>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Now Playing</p>
          <Button size="icon" variant="ghost" onClick={() => setShowLyrics((s) => !s)}>
            <FileText className={`w-5 h-5 ${showLyrics ? 'text-primary' : ''}`} />
          </Button>
        </div>

        {showLyrics ? (
          <div className="flex-1 my-8 overflow-y-auto glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-2">{p.current.name}</h2>
            <p className="text-muted-foreground mb-6">{p.current.artist}</p>
            {loadingLyrics ? (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-white/10 rounded" />)}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{lyrics}</pre>
            )}
          </div>
        ) : (
          <motion.div
            animate={{ rotate: p.isPlaying ? 360 : 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="my-8 mx-auto w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl glow-primary"
          >
            <img src={p.current.image} alt="" className="w-full h-full object-cover" />
          </motion.div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1">{p.current.name}</h1>
          <p className="text-muted-foreground">{p.current.artist} • {p.current.album}</p>
        </div>

        <div className="mb-4">
          <Slider value={[p.progress]} max={p.duration || 30} step={0.1} onValueChange={([v]) => p.seek(v)} />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 tabular-nums">
            <span>{fmt(p.progress)}</span><span>{fmt(p.duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 md:gap-4 mb-6">
          <Button size="icon" variant="ghost" onClick={p.toggleShuffle}>
            <Shuffle className={`w-5 h-5 ${p.shuffle ? 'text-primary' : ''}`} />
          </Button>
          <Button size="icon" variant="ghost" onClick={p.prev}><SkipBack className="w-7 h-7" /></Button>
          <Button size="icon" onClick={p.toggle} className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 glow-primary">
            {p.isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={p.next}><SkipForward className="w-7 h-7" /></Button>
          <Button size="icon" variant="ghost" onClick={p.cycleRepeat}>
            {p.repeat === 'one' ? <Repeat1 className="w-5 h-5 text-primary" /> : <Repeat className={`w-5 h-5 ${p.repeat === 'all' ? 'text-primary' : ''}`} />}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button size="icon" variant="ghost" onClick={() => toggleFavorite(p.current!)}>
            <Heart className={`w-5 h-5 ${isFavorite(p.current.id) ? 'fill-accent text-accent' : ''}`} />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => p.startRadio()} title="Start radio">
            <Radio className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => p.shareCurrent()} title="Share">
            <Share2 className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={p.toggleMute}>
              {p.muted || p.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider value={[p.muted ? 0 : p.volume * 100]} max={100} onValueChange={([v]) => p.setVolume(v / 100)} />
          </div>
          <Button size="icon" variant="ghost" onClick={() => { onClose(); setTimeout(() => window.location.href = '/queue', 100); }}>
            <ListMusic className="w-5 h-5" />
          </Button>
        </div>

        {p.sleepRemaining != null && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            💤 Sleeping in {Math.floor(p.sleepRemaining / 60)}:{String(p.sleepRemaining % 60).padStart(2, '0')}
          </p>
        )}
      </div>
    </motion.div>
  );
}
