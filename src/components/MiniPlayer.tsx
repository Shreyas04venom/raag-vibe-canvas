import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2, Volume1, VolumeX, Shuffle, Repeat, Repeat2, List, Settings, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/contexts/PlayerContext";

interface MiniPlayerProps {
  isVisible?: boolean;
  currentSong?: {
    title: string;
    artist: string;
    albumArt: string;
    duration?: number;
  };
  onExpand?: (isExpanded: boolean) => void;
}

export default function MiniPlayer({
  isVisible = true,
  currentSong = {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    albumArt: "/placeholder.svg",
  },
  onExpand,
}: MiniPlayerProps) {
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [progressLocal, setProgressLocal] = useState([progress || 0]);
  const [volumeLocal, setVolumeLocal] = useState([volume || 70]);

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

  const handleExpandPlayer = () => {
    setIsExpanded(!isExpanded);
    onExpand?.(!isExpanded);
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
      return <Repeat2 className="w-4 h-4" />;
    }
    return <Repeat className="w-4 h-4" />;
  };

  const getVolumeIcon = () => {
    if (volumeLocal[0] === 0) return <VolumeX className="w-4 h-4" />;
    if (volumeLocal[0] < 50) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
        >
          <div className="glass-hover rounded-2xl p-4 max-w-7xl mx-auto">
            {/* Progress Bar with Time */}
            <div className="mb-3 space-y-2">
              <Slider
                value={progressLocal}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(getCurrentTime())}</span>
                <span>{currentSong ? formatTime(typeof currentSong.duration === 'number' ? currentSong.duration : 0) : '0:00'}</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center gap-4">
              {/* Album Art & Info */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={handleExpandPlayer}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={currentSong.albumArt}
                    alt={currentSong.title}
                    className={cn(
                      "w-full h-full object-cover",
                      isPlaying && "animate-pulse"
                    )}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {currentSong.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {currentSong.artist}
                  </p>
                </div>
              </motion.div>

              {/* Main Controls */}
              <div className="flex items-center gap-2">
                {/* Shuffle Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleShuffle}
                  className={cn(
                    "hidden sm:flex transition-colors",
                    isShuffled && "text-primary"
                  )}
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>

                {/* Previous Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previous}
                  className="hidden sm:flex"
                  title="Previous"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                {/* Play/Pause Button */}
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    size="icon"
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent glow-primary"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current" />
                    )}
                  </Button>
                </motion.div>

                {/* Next Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={next}
                  className="hidden sm:flex"
                  title="Next"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>

                {/* Repeat Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRepeat}
                  className={cn(
                    "hidden sm:flex transition-colors",
                    repeatMode !== 'off' && "text-primary"
                  )}
                  title={repeatMode === 'off' ? "Repeat off" : repeatMode === 'all' ? "Repeat all" : "Repeat one"}
                >
                  {getRepeatIcon()}
                </Button>

                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className="hidden md:flex transition-colors"
                  title="Add to Favorites"
                >
                  <Heart
                    className={cn(
                      "w-5 h-5",
                      isFavorite && "fill-accent text-accent"
                    )}
                  />
                </Button>

                {/* Queue Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex"
                  title="Queue"
                >
                  <List className="w-4 h-4" />
                </Button>

                {/* Volume Control */}
                <div className="hidden lg:flex items-center gap-2">
                  {getVolumeIcon()}
                  <Slider
                    value={volumeLocal}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-20"
                  />
                </div>

                {/* Settings Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden xl:flex"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* Expand Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExpandPlayer}
                  className="hidden md:flex"
                  title={isExpanded ? "Minimize" : "Maximize"}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
