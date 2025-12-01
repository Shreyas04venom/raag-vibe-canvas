import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Search as SearchIcon, TrendingUp, Clock, Mic, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import SongCard from "@/components/SongCard";
import MiniPlayer from "@/components/MiniPlayer";
import { useMusic } from "@/contexts/MusicContext";
import { SAMPLE_TRENDING_SONGS, SAMPLE_RECENT_SONGS, SAMPLE_FAVORITE_SONGS } from "../data/songs";

const trendingSearches = [
  "Midnight Dreams",
  "Romantic Songs",
  "Chill Vibes",
  "Electronic",
  "Jazz Music",
  "Trending Now",
];

const recentSearches = ["Midnight Dreams", "Euphoria", "Soul Connection"];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const micRef = useRef<any>(null);
  const { playTrack, isFavorite, toggleFavorite, currentTrack } = useMusic();

  // Combine all songs for searching
  const allSongs = [...SAMPLE_TRENDING_SONGS, ...SAMPLE_RECENT_SONGS, ...SAMPLE_FAVORITE_SONGS];

  // Filter unique songs by ID
  const uniqueSongs = Array.from(
    new Map(allSongs.map((song) => [song.id, song])).values()
  );

  // Search results - filter by name or artist
  const filteredResults = searchQuery.length > 0
    ? uniqueSongs.filter(
        (song) =>
          song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(query.length > 0);
  };

  // Initialize speech recognition
  useEffect(() => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        micRef.current = new SpeechRecognition();
        micRef.current.continuous = false;
        micRef.current.interimResults = false;
        micRef.current.lang = "en-US";

        micRef.current.onstart = () => {
          setIsListening(true);
        };

        micRef.current.onend = () => {
          setIsListening(false);
        };

        micRef.current.onresult = (event: any) => {
          if (event.results && event.results.length > 0) {
            const transcript = event.results[event.results.length - 1][0].transcript;
            if (transcript.trim()) {
              handleSearch(transcript.trim());
            }
          }
        };

        micRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          alert("Microphone not available or permission denied. Please use text search instead.");
        };
      } else {
        console.warn("Speech Recognition not supported in this browser");
      }
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
    }
  }, []);

  const toggleMic = () => {
    if (!micRef.current) {
      alert("Speech Recognition is not available in your browser. Please use Firefox, Chrome, Safari, or Edge.");
      return;
    }
    try {
      if (isListening) {
        micRef.current.stop();
      } else {
        micRef.current.start();
      }
    } catch (error) {
      console.error("Error toggling mic:", error);
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 lg:pb-24">
      <Navigation />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-8">
            Discover Music
          </h1>

          {/* Search Bar with Mic */}
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-14 h-14 text-lg glass-hover bg-white/10 backdrop-blur-md border-white/20 focus:border-primary/50"
            />
            <div className="flex gap-1 absolute right-2 top-1/2 -translate-y-1/2">
              {searchQuery && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 hover:bg-white/10"
                  onClick={() => {
                    setSearchQuery("");
                    setShowResults(false);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className={`h-10 w-10 transition-all ${
                  isListening ? "bg-primary/30 text-primary" : "hover:bg-white/10"
                }`}
                onClick={toggleMic}
                title={isListening ? "Listening..." : "Click to search with voice"}
              >
                <Mic className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </div>
          
          {isListening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary mt-2 text-sm font-medium"
            >
              🎤 Listening... Speak now
            </motion.p>
          )}
        </motion.div>

        {!showResults ? (
          <>
            {/* Recent Searches */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Recent Searches</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={search}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Badge
                      variant="secondary"
                      className="glass-hover text-base py-2 px-4 cursor-pointer hover:bg-primary/30 transition-all"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Trending Searches */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Trending Searches</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trendingSearches.map((search, index) => (
                  <motion.div
                    key={search}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div
                      className="glass-hover rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all bg-gradient-to-br from-primary/10 to-accent/10 border border-white/10"
                      onClick={() => handleSearch(search)}
                    >
                      <p className="font-medium">{search}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </>
        ) : (
          <>
            {/* Search Results */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold">
                  Results for "<span className="gradient-text">{searchQuery}</span>"
                </h2>
                <p className="text-muted-foreground mt-2">
                  {filteredResults.length === 0
                    ? "No songs found"
                    : `Found ${filteredResults.length} ${
                        filteredResults.length === 1 ? "song" : "songs"
                      }`}
                </p>
              </div>

              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredResults.map((song, index) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <SongCard
                        title={song.name}
                        artist={song.artist}
                        albumArt={song.image}
                        duration={`${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}`}
                        onPlay={() => {
                          playTrack(song);
                          setShowPlayer(true);
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <SearchIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No songs found for "<span className="font-semibold">{searchQuery}</span>"
                  </p>
                  <p className="text-muted-foreground/70 text-sm mt-2">
                    Try searching with different keywords
                  </p>
                </motion.div>
              )}
            </motion.section>
          </>
        )}
      </main>

      <MiniPlayer />
    </div>
  );
}

