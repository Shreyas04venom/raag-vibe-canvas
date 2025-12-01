import { motion } from "framer-motion";
import { ListMusic, GripVertical, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import MiniPlayer from "@/components/MiniPlayer";
import { usePlayer } from "@/contexts/PlayerContext";
import EmptyState from "@/components/EmptyState";

export default function Queue() {
  const { queue, currentSong, removeFromQueue, play, clearQueue } = usePlayer();

  // For demo purposes, implement basic drag visual feedback
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  return (
    <div className="min-h-screen pb-32 lg:pb-24">
      <Navigation />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <ListMusic className="w-6 h-6" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold gradient-text">
                  Queue
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {queue.length} song{queue.length !== 1 ? 's' : ''} in queue
              </p>
            </div>

            {queue.length > 0 && (
              <Button
                variant="outline"
                onClick={clearQueue}
                className="glass-hover"
              >
                Clear Queue
              </Button>
            )}
          </div>
        </motion.div>

        {/* Now Playing */}
        {currentSong && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4">Now Playing</h2>
            <div className="glass-hover rounded-2xl p-4 flex items-center gap-4">
              <img
                src={currentSong.albumArt}
                alt={currentSong.title}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{currentSong.title}</h3>
                <p className="text-muted-foreground">{currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Play className="w-5 h-5 fill-current animate-pulse-glow" />
                <span className="font-medium">Playing</span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Queue List */}
        {queue.length === 0 ? (
          <EmptyState
            title="Queue is empty"
            message="Add songs to your queue to see them here"
            actionLabel="Browse Music"
            onAction={() => window.location.href = "/home"}
            icon={<ListMusic className="w-12 h-12 text-primary" />}
          />
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">Next Up</h2>
            <div className="space-y-2">
              {queue.map((song, index) => (
                <motion.div
                  key={`${song.id}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, index)}
                  className="glass-hover rounded-xl p-4 flex items-center gap-4 cursor-move group"
                >
                  {/* Drag Handle */}
                  <GripVertical className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Position */}
                  <span className="text-muted-foreground font-medium w-6">
                    {index + 1}
                  </span>

                  {/* Album Art */}
                  <img
                    src={song.albumArt}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />

                  {/* Song Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{song.title}</h3>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>

                  {/* Duration */}
                  <span className="text-sm text-muted-foreground">
                    {song.duration}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => play(song)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={() => removeFromQueue(song.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <MiniPlayer />
    </div>
  );
}
