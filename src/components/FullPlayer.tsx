import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2, Volume1, VolumeX, Shuffle, Repeat, Repeat2, List, Minimize2, X, Speaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/contexts/PlayerContext";
import LyricsModal from "./LyricsModal";

interface FullPlayerProps {
  isVisible?: boolean;
  currentSong?: {
    title: string;
    artist: string;
    albumArt: string;
    duration?: number;
  };
  onMinimize?: () => void;
}

export default function FullPlayer({
  isVisible = false,
  currentSong = {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    albumArt: "/placeholder.svg",
  },
  onMinimize,
}: FullPlayerProps) {
  const { 
    isPlaying, 
    togglePlay, 
    next, 
    previous, 
    isShuffled, 
    toggleShuffle, 
    repeatMode, 
    toggleRepeat,
    progress,
    seek,
    volume,
    setVolume
  } = usePlayer();

  const [isFavorite, setIsFavorite] = useState(false);
  const [progressLocal, setProgressLocal] = useState([progress || 0]);
  const [volumeLocal, setVolumeLocal] = useState([volume || 70]);
  const [showLyrics, setShowLyrics] = useState(false);

  // Update local progress when context progress changes
  useEffect(() => {
    setProgressLocal([progress || 0]);
  }, [progress]);

  // Update local volume when context volume changes
  useEffect(() => {
    setVolumeLocal([volume || 70]);
  }, [volume]);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleProgressChange = (value: number[]) => {
    setProgressLocal(value);
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolumeLocal(value);
    setVolume(value[0]);
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') {
      return <Repeat2 className="w-6 h-6" />;
    }
    return <Repeat className="w-6 h-6" />;
  };

  const getVolumeIcon = () => {
    if (volumeLocal[0] === 0) return <VolumeX className="w-5 h-5" />;
    if (volumeLocal[0] < 50) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate current time based on progress
  const getCurrentTime = (): number => {
    if (!currentSong) return 0;
    const duration = typeof currentSong.duration === 'number' ? currentSong.duration : 0;
    return (progressLocal[0] / 100) * duration;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full h-full max-w-2xl mx-auto p-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Now Playing</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMinimize}
                className="text-white hover:bg-white/10"
              >
                <Minimize2 className="w-6 h-6" />
              </Button>
            </div>

            {/* Album Art - Large */}
            <motion.div
              animate={{ rotateZ: isPlaying ? 360 : 0 }}
              transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
              className="flex-1 flex items-center justify-center mb-8"
            >
              <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={currentSong.albumArt}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Song Info */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                {currentSong.title}
              </h1>
              <p className="text-xl text-gray-300">
                {currentSong.artist}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-8">
              <Slider
                value={progressLocal}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(getCurrentTime())}</span>
                <span>{currentSong ? formatTime(typeof currentSong.duration === 'number' ? currentSong.duration : 0) : '0:00'}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Shuffle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={cn(
                  "w-12 h-12 transition-colors text-gray-300 hover:text-white",
                  isShuffled && "text-primary"
                )}
                title="Shuffle"
              >
                <Shuffle className="w-6 h-6" />
              </Button>

              {/* Previous Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={previous}
                className="w-12 h-12 text-gray-300 hover:text-white"
                title="Previous"
              >
                <SkipBack className="w-8 h-8" />
              </Button>

              {/* Play/Pause Button */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  size="icon"
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent glow-primary"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current" />
                  )}
                </Button>
              </motion.div>

              {/* Next Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="w-12 h-12 text-gray-300 hover:text-white"
                title="Next"
              >
                <SkipForward className="w-8 h-8" />
              </Button>

              {/* Repeat Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeat}
                className={cn(
                  "w-12 h-12 transition-colors text-gray-300 hover:text-white",
                  repeatMode !== 'off' && "text-primary"
                )}
                title={repeatMode === 'off' ? "Repeat off" : repeatMode === 'all' ? "Repeat all" : "Repeat one"}
              >
                {getRepeatIcon()}
              </Button>
            </div>

            {/* Volume and Favorite */}
            <div className="flex items-center justify-center gap-6 pb-6 border-t border-white/10 pt-6">
              {/* Like Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className="w-12 h-12 transition-colors text-gray-300 hover:text-white"
                title="Add to Favorites"
              >
                <Heart
                  className={cn(
                    "w-6 h-6",
                    isFavorite && "fill-accent text-accent"
                  )}
                />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-4 flex-1 max-w-xs">
                {getVolumeIcon()}
                <Slider
                  value={volumeLocal}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>

              {/* Queue Button */}
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 text-gray-300 hover:text-white"
                title="Queue"
              >
                <List className="w-6 h-6" />
              </Button>

              {/* Settings Button -> Lyrics */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLyrics(true)}
                className="w-12 h-12 text-gray-300 hover:text-white"
                title="Show Lyrics"
              >
                <Speaker className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>

          {/* Lyrics Modal */}
          <LyricsModal
            isOpen={showLyrics}
            onClose={() => setShowLyrics(false)}
            songTitle={currentSong.title}
            artist={currentSong.artist}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
