import { motion } from "framer-motion";
import { Play, Heart, MoreVertical, Music, Plus, Download, User, Radio, Share2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SongCardProps {
  title: string;
  artist: string;
  albumArt?: string;
  duration?: string;
  isLiked?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onAddToPlaylist?: () => void;
  onDownload?: () => void;
  onGoToArtist?: () => void;
  onGoToAlbum?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  className?: string;
}

export default function SongCard({
  title,
  artist,
  albumArt,
  duration = "3:45",
  isLiked: initialLiked = false,
  onPlay,
  onLike,
  onAddToPlaylist,
  onDownload,
  onGoToArtist,
  onGoToAlbum,
  onShare,
  onEdit,
  onDelete,
  onReport,
  className,
}: SongCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(!!albumArt);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  // Generate a gradient color based on title hash
  const getGradientColor = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "from-purple-900 via-purple-800 to-black",
      "from-blue-900 via-blue-800 to-black",
      "from-pink-900 via-pink-800 to-black",
      "from-indigo-900 via-indigo-800 to-black",
      "from-cyan-900 via-cyan-800 to-black",
      "from-rose-900 via-rose-800 to-black",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "glass-hover rounded-2xl p-4 cursor-pointer group relative",
        className
      )}
    >
      {/* Album Art with Play Button Overlay */}
      <div className={`relative mb-4 aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${getGradientColor(title)} flex items-center justify-center`}>
        {albumArt && imageLoaded && (
          <img
            src={albumArt}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        {!albumArt || !imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="w-12 h-12 text-white opacity-60" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        >
          <Button
            size="icon"
            onClick={onPlay}
            className="w-16 h-16 rounded-full bg-primary hover:bg-primary-glow glow-primary"
          >
            <Play className="w-8 h-8 fill-current" />
          </Button>
        </motion.div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
          {duration}
        </div>
      </div>

      {/* Song Info */}
      <div className="space-y-1 mb-3">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{artist}</p>
      </div>
    </motion.div>
  );
}
