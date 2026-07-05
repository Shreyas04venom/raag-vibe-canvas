import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import type { Track } from '@/types/track';
import { useAuth } from './AuthContext';
import { pushHistory } from '@/services/library.service';
import { toast } from 'sonner';

type Repeat = 'off' | 'one' | 'all';

interface PlayerCtx {
  current: Track | null;
  queue: Track[];
  index: number;
  isPlaying: boolean;
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
}

const Ctx = createContext<PlayerCtx | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>('off');
  const [showFull, setShowFull] = useState(false);
  const [sleepAt, setSleepAt] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);

  // create audio once
  useEffect(() => {
    const a = new Audio();
    a.preload = 'metadata';
    audioRef.current = a;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration || 0);
    const onEnd = () => handleEnd();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onErr = () => { toast.error('Preview unavailable for this track'); handleEnd(); };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // volume/mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Media Session
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.name,
      artist: current.artist,
      album: current.album,
      artwork: current.image ? [{ src: current.image, sizes: '512x512' }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => toggle());
    navigator.mediaSession.setActionHandler('pause', () => toggle());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('previoustrack', () => prev());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      else if (e.code === 'ArrowRight' && e.shiftKey) next();
      else if (e.code === 'ArrowLeft' && e.shiftKey) prev();
      else if (e.key === 'm' || e.key === 'M') toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // sleep timer
  useEffect(() => {
    if (sleepAt == null) { setSleepRemaining(null); return; }
    const id = setInterval(() => {
      const rem = Math.max(0, Math.round((sleepAt - Date.now()) / 1000));
      setSleepRemaining(rem);
      if (rem === 0) {
        audioRef.current?.pause();
        setSleepAt(null);
        toast.info('Sleep timer ended');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sleepAt]);

  const play = useCallback((track: Track, newQueue?: Track[]) => {
    const q = newQueue ?? [track];
    const idx = q.findIndex((t) => t.id === track.id);
    setQueue(q);
    setIndex(idx >= 0 ? idx : 0);
    setCurrent(track);
    setShowFull(false);
    const a = audioRef.current!;
    a.src = track.previewUrl;
    a.play().catch(() => toast.error('Could not play track'));
    if (user) pushHistory(user.id, track).catch(() => {});
  }, [user]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (a.paused) a.play().catch(() => {}); else a.pause();
  }, [current]);

  const handleEnd = useCallback(() => {
    if (repeat === 'one') {
      const a = audioRef.current!;
      a.currentTime = 0; a.play().catch(() => {});
      return;
    }
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeat]);

  const next = useCallback(() => {
    if (!queue.length) return;
    let nextIdx: number;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    else nextIdx = index + 1;
    if (nextIdx >= queue.length) {
      if (repeat === 'all') nextIdx = 0;
      else { audioRef.current?.pause(); return; }
    }
    const t = queue[nextIdx];
    setIndex(nextIdx); setCurrent(t);
    const a = audioRef.current!;
    a.src = t.previewUrl; a.play().catch(() => {});
    if (user) pushHistory(user.id, t).catch(() => {});
  }, [queue, index, shuffle, repeat, user]);

  const prev = useCallback(() => {
    if (!queue.length) return;
    const a = audioRef.current!;
    if (a.currentTime > 3) { a.currentTime = 0; return; }
    const i = Math.max(0, index - 1);
    const t = queue[i];
    setIndex(i); setCurrent(t);
    a.src = t.previewUrl; a.play().catch(() => {});
  }, [queue, index]);

  const seek = (s: number) => { if (audioRef.current) audioRef.current.currentTime = s; };
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

  return (
    <Ctx.Provider value={{
      current, queue, index, isPlaying, progress, duration, volume, muted, shuffle, repeat, showFull,
      play, toggle, next, prev, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat,
      addToQueue, playNext, removeFromQueue, clearQueue, setShowFull, reorderQueue, sleepIn, sleepRemaining,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePlayer = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePlayer outside provider');
  return c;
};
