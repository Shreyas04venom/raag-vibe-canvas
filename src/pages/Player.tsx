import { motion } from "framer-motion";
import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Shuffle,
  Repeat,
  ListMusic,
  Share2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import albumSample1 from "@/assets/album-sample-1.jpg";

export default function Player() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState([45]);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 flex items-center justify-between"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ChevronDown className="w-6 h-6" />
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Playing from</p>
          <p className="font-semibold">Rainy Day Mix</p>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Share2 className="w-5 h-5" />
        </Button>
      </motion.header>

      {/* Album Art */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex items-center justify-center px-6 py-8"
      >
        <div className="relative max-w-lg w-full aspect-square">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/40 to-secondary/40 rounded-3xl blur-3xl" />
          
          {/* Album Art */}
          <motion.div
            animate={{
              rotate: isPlaying ? 360 : 0,
            }}
            transition={{
              duration: 20,
              repeat: isPlaying ? Infinity : 0,
              ease: "linear",
            }}
            className="relative rounded-3xl overflow-hidden glass border-4 border-white/10"
          >
            <img
              src={albumSample1}
              alt="Album Art"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Song Info & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 space-y-6"
      >
        {/* Song Details */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Tum Hi Ho</h1>
            <p className="text-lg text-muted-foreground">Arijit Singh</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart
              className={`w-8 h-8 ${
                isLiked ? "fill-accent text-accent" : "text-muted-foreground"
              }`}
            />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={progress}
            onValueChange={setProgress}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>2:15</span>
            <span>4:22</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsShuffled(!isShuffled)}
          >
            <Shuffle
              className={`w-6 h-6 ${
                isShuffled ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </motion.button>

          <Button variant="ghost" size="icon" className="w-12 h-12">
            <SkipBack className="w-6 h-6" />
          </Button>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent glow-primary"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current" />
              )}
            </Button>
          </motion.div>

          <Button variant="ghost" size="icon" className="w-12 h-12">
            <SkipForward className="w-6 h-6" />
          </Button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              setRepeatMode(
                repeatMode === "off"
                  ? "all"
                  : repeatMode === "all"
                  ? "one"
                  : "off"
              )
            }
          >
            <Repeat
              className={`w-6 h-6 ${
                repeatMode !== "off" ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </motion.button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            className="glass-hover flex-1 max-w-xs"
            onClick={() => navigate("/queue")}
          >
            <ListMusic className="w-5 h-5 mr-2" />
            Queue
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
