import { motion } from "framer-motion";
import { Play, TrendingUp, Clock, Heart, ChevronRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import WeatherCard from "@/components/WeatherCard";
import SongCard from "@/components/SongCard";
import Navigation from "@/components/Navigation";
import MiniPlayer from "@/components/MiniPlayer";
import FullPlayer from "@/components/FullPlayer";
import { useState, useRef, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Link } from "react-router-dom";
import { songsService, type Song } from "@/services/songs.service";

const Home = () => {
  const [showPlayer, setShowPlayer] = useState(true);
  const [isFullPlayer, setIsFullPlayer] = useState(false);
  const { currentSong, play, addToQueue, isFavorite, toggleFavorite } = usePlayer();
  
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch songs from Spotify
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const [trending, recent, favorites] = await Promise.all([
          songsService.getTrendingSongs(),
          songsService.getRecentSongs(),
          songsService.getFavoriteSongs(),
        ]);
        setTrendingSongs(trending);
        setRecentSongs(recent);
        setFavoriteSongs(favorites);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Enable horizontal scrolling with trackpad gesture
  useEffect(() => {
    const handleWheel = (e) => {
      const element = e.currentTarget;
      // Only handle trackpad horizontal scrolling (deltaX)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        element.scrollLeft += e.deltaX;
      }
    };

    const attachScrollListener = () => {
      const scrollAreas = document.querySelectorAll('[data-radix-scroll-area-viewport]');
      scrollAreas.forEach((ref) => {
        ref.addEventListener("wheel", handleWheel, { passive: false });
      });
    };

    // Attach listeners after render
    const timeoutId = setTimeout(attachScrollListener, 100);

    // Re-attach on interval to catch dynamically added scroll areas
    const intervalId = setInterval(attachScrollListener, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      const scrollAreas = document.querySelectorAll('[data-radix-scroll-area-viewport]');
      scrollAreas.forEach((ref) => {
        ref.removeEventListener("wheel", handleWheel);
      });
    };
  }, []);

  // Helper function to play a song and populate queue
  const playSongWithQueue = (song: Song, allSongs: Song[]) => {
    // Play the selected song
    play(song);
    
    // Add remaining songs to queue
    const remainingSongs = allSongs.filter(s => s.id !== song.id);
    remainingSongs.forEach(s => {
      addToQueue(s);
    });
    
    setShowPlayer(true);
  };

  return (
    <div className="min-h-screen pb-32 lg:pb-24">
      <Navigation />

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            Good Evening, <span className="gradient-text">Shreyas!</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Perfect weather for some soulful music
          </p>
        </motion.div>

        {/* Weather Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <WeatherCard
              temperature={24}
              condition="rainy"
              location="Mumbai, India"
            />
            
            <div className="glass-hover rounded-3xl p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4 gradient-text">
                Rainy Day Vibes 🌧️
              </h2>
              <p className="text-muted-foreground mb-6">
                Cozy up with romantic ballads perfect for this weather
              </p>
              <Button
                size="lg"
                className="w-fit bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                onClick={() => {
                  if (favoriteSongs.length > 0) {
                    playSongWithQueue(favoriteSongs[0], favoriteSongs);
                  }
                }}
                disabled={loading}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                {loading ? "Loading..." : "Play Weather Mix"}
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Trending Now */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            <Link to="/trending-all">
              <Button variant="ghost" className="gap-2">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <ScrollArea 
            className="w-full"
          >
            <div className="flex gap-4 pb-4">
              {loading ? (
                <div className="flex items-center justify-center w-full h-40">
                  <Loader className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                trendingSongs.slice(0, 15).map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex-shrink-0 w-[280px]"
                  >
                    <SongCard
                      title={song.title}
                      artist={song.artist}
                      albumArt={song.albumArt}
                      duration={`${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}`}
                      isLiked={isFavorite(song.id)}
                      onPlay={() => playSongWithQueue(song, trendingSongs)}
                      onLike={() => toggleFavorite(song)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.section>

        {/* Mini Player */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Recently Played</h2>
            </div>
            <Link to="/library?tab=recent">
              <Button variant="ghost" className="gap-2">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <ScrollArea 
            className="w-full"
          >
            <div className="flex gap-4 pb-4">
              {loading ? (
                <div className="flex items-center justify-center w-full h-40">
                  <Loader className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                recentSongs.slice(0, 15).map((song, index) => (
                  <motion.div
                    key={`recent-${song.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex-shrink-0 w-[280px]"
                  >
                    <SongCard
                      title={song.title}
                      artist={song.artist}
                      albumArt={song.albumArt}
                      duration={`${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}`}
                      isLiked={isFavorite(song.id)}
                      onPlay={() => playSongWithQueue(song, recentSongs)}
                      onLike={() => toggleFavorite(song)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.section>

        {/* Your Favorites */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-pink-600 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Your Favorites</h2>
            </div>
            <Link to="/library?tab=favorites">
              <Button variant="ghost" className="gap-2">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <ScrollArea 
            className="w-full"
          >
            <div className="flex gap-4 pb-4">
              {loading ? (
                <div className="flex items-center justify-center w-full h-40">
                  <Loader className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                favoriteSongs.slice(0, 15).map((song, index) => (
                  <motion.div
                    key={`fav-${song.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex-shrink-0 w-[280px]"
                  >
                    <SongCard
                      title={song.title}
                      artist={song.artist}
                      albumArt={song.albumArt}
                      duration={`${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}`}
                      isLiked={isFavorite(song.id)}
                      onPlay={() => playSongWithQueue(song, favoriteSongs)}
                      onLike={() => toggleFavorite(song)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.section>
      </main>

      {/* Mini Player */}
      <MiniPlayer
        isVisible={showPlayer && !!currentSong && !isFullPlayer}
        currentSong={currentSong ? {
          title: currentSong.title,
          artist: currentSong.artist,
          albumArt: currentSong.albumArt,
          duration: currentSong.duration,
        } : undefined}
        onExpand={(isExpanded) => setIsFullPlayer(isExpanded)}
      />

      {/* Full Player */}
      <FullPlayer
        isVisible={isFullPlayer && !!currentSong}
        currentSong={currentSong ? {
          title: currentSong.title,
          artist: currentSong.artist,
          albumArt: currentSong.albumArt,
          duration: currentSong.duration,
        } : undefined}
        onMinimize={() => setIsFullPlayer(false)}
      />
    </div>
  );
};

export default Home;
