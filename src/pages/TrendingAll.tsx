import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import SongCard from "@/components/SongCard";
import MiniPlayer from "@/components/MiniPlayer";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useMusic } from "@/contexts/MusicContext";
import { SAMPLE_TRENDING_SONGS } from "../data/songs";

// All sample data is now imported from data/songs.ts

export default function TrendingAll() {
  const [showPlayer, setShowPlayer] = useState(true);
  const { currentTrack, searchResults, playTrack, isFavorite, toggleFavorite } = useMusic();

  const songs = searchResults?.length ? searchResults : SAMPLE_TRENDING_SONGS;

  return (
    <div className="min-h-screen pb-32 lg:pb-24">
      <Navigation />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <Link to="/">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-primary/30 hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold gradient-text">
                Trending Now
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Discover the hottest tracks right now
            </p>
          </div>
        </motion.div>

        {/* Grid Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {songs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.5 }}
            >
              <SongCard
                title={song.name}
                artist={song.artist}
                albumArt={song.image}
                duration={typeof song.duration === 'number' ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : song.duration}
                isLiked={isFavorite(song.id)}
                onPlay={() => { playTrack(song); setShowPlayer(true); }}
                onLike={() => toggleFavorite(song)}
              />
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Mini Player */}
      <MiniPlayer
        isVisible={showPlayer && !!currentTrack}
        currentSong={currentTrack ? {
          title: currentTrack.name,
          artist: currentTrack.artist,
          albumArt: currentTrack.image,
        } : undefined}
      />
    </div>
  );
}
