import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import type { Track } from '@/types/track';
import { useAuth } from './AuthContext';
import { pushHistory } from '@/services/library.service';
import { aiRecommend, searchMusic } from '@/services/music.service';
import { createYTController, YTController } from '@/lib/ytPlayer';
import { toast } from 'sonner';

type Repeat = 'off' | 'one' | 'all';

interface PlayerCtx {
  current: Track | null;
  queue: Track[];
  index: number;
  isPlaying: boolean;
  isBuffering: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: Repeat;
  showFull: boolean;
  play: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (s: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (t: Track) => void;
  playNext: (t: Track) => void;
  removeFromQueue: (i: number) => void;
  clearQueue: () => void;
  setShowFull: (v: boolean) => void;
  reorderQueue: (from: number, to: number) => void;
  sleepIn: (minutes: number | null) => void;
  sleepRemaining: number | null;
  startRadio: (seed?: Track) => Promise<void>;
  shareCurrent: () => Promise<void>;
}

const Ctx = createContext<PlayerCtx | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytRef = useRef<YTController | null>(null);
  const ytReadyRef = useRef<Promise<YTController> | null>(null);
  const pollRef = useRef<number | null>(null);
  const currentRef = useRef<Track | null>(null);

  const [current, setCurrent] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>('off');
  const [showFull, setShowFull] = useState(false);
  const [sleepAt, setSleepAt] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);

  useEffect(() => { currentRef.current = current; }, [current]);

  // Get/lazy-init the YT controller
  const getYT = useCallback((): Promise<YTController> => {
    if (ytRef.current) return Promise.resolve(ytRef.current);
    if (ytReadyRef.current) return ytReadyRef.current;
    ytReadyRef.current = createYTController('yt-player-mount').then((c) => {
      ytRef.current = c;
      c.setVolume(volume);
      c.mute(muted);
      c.onState((s) => {
        if (s === 'playing') { setIsPlaying(true); setIsBuffering(false); }
        else if (s === 'paused') { setIsPlaying(false); setIsBuffering(false); }
        else if (s === 'buffering') setIsBuffering(true);
        else if (s === 'ended') handleEndRef.current();
      });
      return c;
    });
    return ytReadyRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // <audio> for iTunes fallback
  useEffect(() => {
    const a = new Audio();
    a.preload = 'metadata';
    audioRef.current = a;
    const onTime = () => { if (currentRef.current?.source !== 'youtube') setProgress(a.currentTime); };
    const onDur = () => { if (currentRef.current?.source !== 'youtube') setDuration(a.duration || 0); };
    const onEnd = () => { if (currentRef.current?.source !== 'youtube') handleEndRef.current(); };
    const onPlay = () => { if (currentRef.current?.source !== 'youtube') setIsPlaying(true); };
    const onPause = () => { if (currentRef.current?.source !== 'youtube') setIsPlaying(false); };
    const onErr = () => { if (currentRef.current?.source !== 'youtube') { toast.error('Preview unavailable'); handleEndRef.current(); } };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onDur);
    a.addEventListener('ended', onEnd);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('error', onErr);
    return () => {
      a.pause();
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onDur);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('error', onErr);
    };
  }, []);

  // Poll YT time/duration
  useEffect(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      if (currentRef.current?.source === 'youtube' && ytRef.current) {
        setProgress(ytRef.current.getTime());
        const d = ytRef.current.getDuration();
        if (d) setDuration(d);
      }
    }, 500);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, []);

  // Apply volume/mute to both engines
  useEffect(() => {
    if (audioRef.current) { audioRef.current.volume = volume; audioRef.current.muted = muted; }
    ytRef.current?.setVolume(volume);
    ytRef.current?.mute(muted);
  }, [volume, muted]);

  // Media Session
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.name, artist: current.artist, album: current.album,
      artwork: current.image ? [{ src: current.image, sizes: '512x512' }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => toggle());
    navigator.mediaSession.setActionHandler('pause', () => toggle());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('previoustrack', () => prev());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      else if (e.code === 'ArrowRight' && e.shiftKey) next();
      else if (e.code === 'ArrowLeft' && e.shiftKey) prev();
      else if (e.key === 'm' || e.key === 'M') toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // Sleep timer
  useEffect(() => {
    if (sleepAt == null) { setSleepRemaining(null); return; }
    const id = setInterval(() => {
      const rem = Math.max(0, Math.round((sleepAt - Date.now()) / 1000));
      setSleepRemaining(rem);
      if (rem === 0) { pauseAny(); setSleepAt(null); toast.info('Sleep timer ended'); }
    }, 1000);
    return () => clearInterval(id);
  }, [sleepAt]);

  const pauseAny = () => {
    audioRef.current?.pause();
    ytRef.current?.pause();
  };

  const loadTrack = useCallback(async (t: Track, autoplay: boolean) => {
    setProgress(0);
    setDuration(t.duration || 0);
    setIsBuffering(true);
    if (t.source === 'youtube' && t.videoId) {
      audioRef.current?.pause();
      const yt = await getYT();
      yt.load(t.videoId, autoplay);
    } else {
      ytRef.current?.pause();
      const a = audioRef.current!;
      a.src = t.previewUrl;
      if (autoplay) {
        try { await a.play(); } catch { toast.error('Could not play track'); }
      }
    }
  }, [getYT]);

  const play = useCallback((track: Track, newQueue?: Track[]) => {
    const q = newQueue ?? [track];
    const idx = q.findIndex((t) => t.id === track.id);
    setQueue(q);
    setIndex(idx >= 0 ? idx : 0);
    setCurrent(track);
    setShowFull(false);
    loadTrack(track, true);
    if (user) pushHistory(user.id, track).catch(() => {});
  }, [user, loadTrack]);

  const toggle = useCallback(() => {
    const t = currentRef.current;
    if (!t) return;
    if (t.source === 'youtube') {
      if (isPlaying) ytRef.current?.pause(); else ytRef.current?.play();
    } else {
      const a = audioRef.current!;
      if (a.paused) a.play().catch(() => {}); else a.pause();
    }
  }, [isPlaying]);

  const handleEndRef = useRef<() => void>(() => {});
  useEffect(() => {
    handleEndRef.current = () => {
      if (repeat === 'one') {
        if (currentRef.current?.source === 'youtube') { ytRef.current?.seek(0); ytRef.current?.play(); }
        else { const a = audioRef.current!; a.currentTime = 0; a.play().catch(() => {}); }
        return;
      }
      next();
    };
  });

  const next = useCallback(() => {
    if (!queue.length) return;
    let nextIdx: number;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    else nextIdx = index + 1;
    if (nextIdx >= queue.length) {
      if (repeat === 'all') nextIdx = 0;
      else { pauseAny(); return; }
    }
    const t = queue[nextIdx];
    setIndex(nextIdx); setCurrent(t);
    loadTrack(t, true);
    if (user) pushHistory(user.id, t).catch(() => {});
  }, [queue, index, shuffle, repeat, user, loadTrack]);

  const prev = useCallback(() => {
    if (!queue.length) return;
    const t = currentRef.current;
    const time = t?.source === 'youtube' ? (ytRef.current?.getTime() ?? 0) : (audioRef.current?.currentTime ?? 0);
    if (time > 3) {
      if (t?.source === 'youtube') ytRef.current?.seek(0);
      else if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    const i = Math.max(0, index - 1);
    const nt = queue[i];
    setIndex(i); setCurrent(nt);
    loadTrack(nt, true);
  }, [queue, index, loadTrack]);

  const seek = (s: number) => {
    if (currentRef.current?.source === 'youtube') ytRef.current?.seek(s);
    else if (audioRef.current) audioRef.current.currentTime = s;
  };
  const setVolume = (v: number) => { setVolumeState(v); if (v > 0) setMuted(false); };
  const toggleMute = () => setMuted((m) => !m);
  const toggleShuffle = () => setShuffle((s) => { toast.success(s ? 'Shuffle off' : 'Shuffle on'); return !s; });
  const cycleRepeat = () => setRepeat((r) => { const n = r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'; toast.success(`Repeat ${n}`); return n; });

  const addToQueue = (t: Track) => { setQueue((q) => [...q, t]); toast.success('Added to queue'); };
  const playNext = (t: Track) => { setQueue((q) => { const n = [...q]; n.splice(index + 1, 0, t); return n; }); toast.success('Playing next'); };
  const removeFromQueue = (i: number) => setQueue((q) => q.filter((_, idx) => idx !== i));
  const clearQueue = () => { setQueue(current ? [current] : []); setIndex(current ? 0 : -1); };
  const reorderQueue = (from: number, to: number) => setQueue((q) => { const n = [...q]; const [it] = n.splice(from, 1); n.splice(to, 0, it); return n; });
  const sleepIn = (minutes: number | null) => { setSleepAt(minutes ? Date.now() + minutes * 60000 : null); if (minutes) toast.success(`Sleep in ${minutes}m`); };

  const startRadio = useCallback(async (seed?: Track) => {
    const s = seed ?? currentRef.current;
    if (!s) { toast.error('Nothing to seed radio'); return; }
    toast.info('Building your radio…');
    try {
      const rec = await aiRecommend('any', 'similar', [s.artist]);
      const queries: string[] = Array.isArray(rec?.queries) && rec.queries.length
        ? rec.queries
        : [`${s.artist} songs`, `${s.artist} similar`, `like ${s.name}`];
      const batches = await Promise.all(queries.slice(0, 4).map((q) => searchMusic(q, 8)));
      const seen = new Set<string>([s.id]);
      const radio: Track[] = [s];
      for (const b of batches) for (const t of b) if (!seen.has(t.id)) { seen.add(t.id); radio.push(t); }
      if (radio.length <= 1) { toast.error('Could not build radio'); return; }
      setQueue(radio); setIndex(0); setCurrent(radio[0]);
      loadTrack(radio[0], true);
      toast.success(`Radio started · ${radio.length} tracks`);
    } catch {
      toast.error('Radio failed');
    }
  }, [loadTrack]);

  const shareCurrent = useCallback(async () => {
    const t = currentRef.current;
    if (!t) return;
    const url = t.videoId ? `https://youtu.be/${t.videoId}` : window.location.href;
    const shareData = { title: t.name, text: `${t.name} — ${t.artist}`, url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
    } catch { /* user cancelled */ }
  }, []);

  return (
    <Ctx.Provider value={{
      current, queue, index, isPlaying, isBuffering, progress, duration, volume, muted, shuffle, repeat, showFull,
      play, toggle, next, prev, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat,
      addToQueue, playNext, removeFromQueue, clearQueue, setShowFull, reorderQueue, sleepIn, sleepRemaining,
      startRadio, shareCurrent,
    }}>
      {children}
      {/* Hidden YouTube player mount — required by the IFrame API */}
      <div style={{ position: 'fixed', width: 1, height: 1, opacity: 0, pointerEvents: 'none', left: -9999, top: -9999 }}>
        <div id="yt-player-mount" />
      </div>
    </Ctx.Provider>
  );
}

export const usePlayer = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePlayer outside provider');
  return c;
};
