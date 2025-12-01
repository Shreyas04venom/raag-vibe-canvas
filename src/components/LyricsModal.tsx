import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { lyricsService } from "@/services/lyrics.service";

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle?: string;
  artist?: string;
}

export default function LyricsModal({
  isOpen,
  onClose,
  songTitle = "Unknown Track",
  artist = "Unknown Artist",
}: LyricsModalProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && songTitle && artist) {
      fetchLyrics();
    }
  }, [isOpen, songTitle, artist]);

  const fetchLyrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await lyricsService.getLyricsWithFallback(artist, songTitle);
      
      if (result) {
        setLyrics(lyricsService.formatLyrics(result.lyrics));
      } else {
        setError("Lyrics not found for this song");
        setLyrics(null);
      }
    } catch (err) {
      setError("Failed to fetch lyrics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Music className="w-6 h-6" />
                  Lyrics
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {songTitle} - {artist}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                  <Music className="w-12 h-12 text-gray-600" />
                  <p className="text-gray-400">{error}</p>
                  <Button
                    onClick={fetchLyrics}
                    variant="outline"
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : lyrics ? (
                <div className="space-y-4 pr-4">
                  {lyrics.split("\n").map((line, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        "text-gray-300 leading-relaxed",
                        line.trim() === "" && "h-4",
                        line.toLowerCase().includes("[") &&
                          "text-gray-500 italic text-sm font-semibold"
                      )}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              ) : null}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex justify-end gap-2">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
