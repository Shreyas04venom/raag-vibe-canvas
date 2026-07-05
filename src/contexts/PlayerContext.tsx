import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { webAudioPlayer } from '@/services/web-audio-player';

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number; // in seconds
  album?: string;
  genre?: string;
  preview_url?: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Song[];
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  play: (song: Song) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  clearQueue: () => void;
  playNext: (song: Song) => void;
  isFavorite: (songId: string) => boolean;
  toggleFavorite: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(75);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [favorites, setFavorites] = useState<Song[]>([]);
  const { toast } = useToast();

  // Sync progress with actual audio playback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying && currentSong) {
      // Configure audio player callbacks
      webAudioPlayer.setConfig({
        onEnded: () => {
          // Song ended - handle repeat/queue
          if (repeatMode === 'one') {
            let urlToPlay = currentSong.preview_url;
            if (!urlToPlay || urlToPlay === 'null' || urlToPlay === '') {
              const fallbackUrl = webAudioPlayer.getGeneratedAudioUrl();
              urlToPlay = fallbackUrl || '';
            }
            webAudioPlayer.stop();
            webAudioPlayer.play(urlToPlay).catch(console.error);
          } else if (queue.length > 0) {
            // Play next song from queue
            const nextSong = queue[0];
            setCurrentSong(nextSong);
            setQueue(queue.slice(1));
            setProgress(0);
            let urlToPlay = nextSong.preview_url;
            if (!urlToPlay || urlToPlay === 'null' || urlToPlay === '') {
              const fallbackUrl = webAudioPlayer.getGeneratedAudioUrl();
              urlToPlay = fallbackUrl || '';
            }
            webAudioPlayer.play(urlToPlay).catch(console.error);
          } else if (repeatMode === 'all') {
            // Repeat all but no queue
            setProgress(0);
          } else {
            // Stop playing
            setIsPlaying(false);
          }
        },
      });

      // Update progress based on actual audio time
      interval = setInterval(() => {
        const currentTime = webAudioPlayer.getCurrentTime();
        const duration = webAudioPlayer.getDuration();
        
        if (duration > 0) {
          const newProgress = (currentTime / duration) * 100;
          setProgress(Math.min(newProgress, 100));
        }
      }, 100); // Update every 100ms for smooth display
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, currentSong, repeatMode, queue]);

  const play = (song: Song) => {
    console.log('🎵 [PLAY] Song selected:', song.title);
    console.log('📊 [PLAY] Song data:', {
      title: song.title,
      artist: song.artist,
      preview_url: song.preview_url ? song.preview_url.substring(0, 60) + '...' : 'NONE',
      has_preview: !!song.preview_url
    });
    
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    
    // PRIORITY: Try Spotify preview URL first (they support CORS for blob: URLs)
    let urlToPlay = song.preview_url;
    let isSpotifyPreview = false;
    
    if (urlToPlay && urlToPlay !== 'null' && urlToPlay !== '') {
      console.log('✅ [PLAY] Found Spotify preview URL!');
      isSpotifyPreview = true;
    } else {
      console.warn('⚠️ [PLAY] No Spotify preview, using generated audio');
      const fallbackUrl = webAudioPlayer.getGeneratedAudioUrl();
      if (fallbackUrl) {
        urlToPlay = fallbackUrl;
      } else {
        throw new Error('No audio source available');
      }
    }

    console.log('🔊 [PLAY] Playing:', isSpotifyPreview ? 'Spotify Preview' : 'Generated Audio');
    
    webAudioPlayer.play(urlToPlay)
      .then(() => {
        console.log('✅ [PLAY] Audio started - Current time:', webAudioPlayer.getCurrentTime());
      })
      .catch((err) => {
        console.error('❌ [PLAY] Error:', err);
        // If Spotify URL failed, try generated audio as backup
        if (isSpotifyPreview) {
          console.log('🔄 [PLAY] Spotify failed, trying generated audio backup...');
          const fallbackUrl = webAudioPlayer.getGeneratedAudioUrl();
          if (fallbackUrl) {
            return webAudioPlayer.play(fallbackUrl);
          }
        }
        throw err;
      })
      .catch((err) => {
        console.error('❌ [PLAY] All attempts failed:', err);
        toast({
          title: 'Playback Error',
          description: `Could not play: ${err}`,
          variant: 'destructive',
        });
      });
    
    toast({
      title: 'Now Playing',
      description: `${song.title} - ${song.artist}`,
    });
  };

  const pause = () => {
    setIsPlaying(false);
    webAudioPlayer.pause();
  };

  const togglePlay = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (newPlayingState && currentSong) {
      let urlToPlay = currentSong.preview_url;
      if (!urlToPlay || urlToPlay === 'null' || urlToPlay === '') {
        const fallbackUrl = webAudioPlayer.getGeneratedAudioUrl();
        urlToPlay = fallbackUrl || '';
      }
      webAudioPlayer.play(urlToPlay).catch((err) => {
        console.error('❌ [TOGGLE] Error:', err);
      });
    } else if (!newPlayingState) {
      webAudioPlayer.pause();
    }
  };

  const next = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setCurrentSong(nextSong);
      setQueue(queue.slice(1));
      setProgress(0);
      setIsPlaying(true);
      
      // Play the next song
      let urlToPlay = nextSong.preview_url;
      if (!urlToPlay || urlToPlay === 'null' || urlToPlay === '') {
        const fallbackUrl = webAudioPlayer.getGeneratedAudioUrl();
        urlToPlay = fallbackUrl || '';
      }
      webAudioPlayer.stop();
      webAudioPlayer.play(urlToPlay).catch((err) => {
        console.error('Failed to play next track:', err);
      });
      
      toast({
        title: 'Next Track',
        description: `${nextSong.title} - ${nextSong.artist}`,
      });
    } else {
      toast({
        title: 'Queue Empty',
        description: 'Add more songs to continue playing.',
      });
      setIsPlaying(false);
    }
  };

  const previous = () => {
    // If we're more than 3 seconds into the song, restart it
    const currentTime = webAudioPlayer.getCurrentTime();
    if (currentTime > 3) {
      webAudioPlayer.setCurrentTime(0);
      setProgress(0);
      if (!isPlaying) {
        setIsPlaying(true);
        webAudioPlayer.play(currentSong?.preview_url || '').catch(console.error);
      }
      toast({
        title: 'Restarting',
        description: currentSong?.title || 'Track',
      });
    } else {
      // If less than 3 seconds, go to actual previous (would need history)
      setProgress(0);
      webAudioPlayer.setCurrentTime(0);
      if (!isPlaying) {
        setIsPlaying(true);
        webAudioPlayer.play(currentSong?.preview_url || '').catch(console.error);
      }
      toast({
        title: 'Restarting Song',
        description: currentSong?.title || 'Track',
      });
    }
  };

  const seek = (position: number) => {
    setProgress(position);
    
    // Seek in audio player
    if (currentSong) {
      const duration = typeof currentSong.duration === 'number' ? currentSong.duration : 0;
      const seekTime = (position / 100) * duration;
      webAudioPlayer.seek(seekTime);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    // Set volume on audio player (convert 0-100 to 0-1)
    webAudioPlayer.setVolume(newVolume / 100);
  };

  const addToQueue = (song: Song) => {
    setQueue([...queue, song]);
    toast({
      title: 'Added to Queue',
      description: `${song.title} added to queue`,
    });
  };

  const removeFromQueue = (songId: string) => {
    setQueue(queue.filter(s => s.id !== songId));
    toast({
      title: 'Removed from Queue',
      description: 'Song removed from queue',
    });
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    const newQueue = Array.from(queue);
    const [removed] = newQueue.splice(startIndex, 1);
    newQueue.splice(endIndex, 0, removed);
    setQueue(newQueue);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    if (!isShuffled) {
      // Shuffle the queue
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      toast({
        title: 'Shuffle On',
        description: 'Queue shuffled',
      });
    } else {
      toast({
        title: 'Shuffle Off',
        description: 'Playing in order',
      });
    }
  };

  const toggleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    
    const messages = {
      off: 'Repeat Off',
      all: 'Repeat All',
      one: 'Repeat One',
    };
    
    toast({
      title: messages[nextMode],
      description: nextMode === 'off' ? 'Playing through once' : `Repeating ${nextMode === 'all' ? 'queue' : 'current song'}`,
    });
  };

  const clearQueue = () => {
    setQueue([]);
    toast({
      title: 'Queue Cleared',
      description: 'All songs removed from queue',
    });
  };

  const playNext = (song: Song) => {
    setQueue([song, ...queue]);
    toast({
      title: 'Playing Next',
      description: `${song.title} will play next`,
    });
  };

  const isFavorite = (songId: string): boolean => {
    return favorites.some(s => s.id === songId);
  };

  const toggleFavorite = (song: Song) => {
    if (isFavorite(song.id)) {
      setFavorites(favorites.filter(s => s.id !== song.id));
      toast({
        title: 'Removed from Favorites',
        description: `${song.title} removed`,
      });
    } else {
      setFavorites([...favorites, song]);
      toast({
        title: 'Added to Favorites',
        description: `${song.title} added`,
      });
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        volume,
        queue,
        isShuffled,
        repeatMode,
        play,
        pause,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        toggleShuffle,
        toggleRepeat,
        clearQueue,
        playNext,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
