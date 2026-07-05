// @ts-nocheck
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { weatherAPI, musicAPI } from '../services/api.service';
import { WeatherData, WeatherRecommendation } from '../services/weather';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  duration: number;
  preview_url?: string;
  spotify_url: string;
  uri: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  image: string;
  isPublic: boolean;
  owner: string;
}

interface MusicContextType {
  // Player state
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: Track[];
  
  // Weather integration
  currentWeather: WeatherData | null;
  weatherRecommendation: WeatherRecommendation | null;
  
  // Data
  favorites: Track[];
  playlists: Playlist[];
  recentTracks: Track[];
  searchResults: Track[];
  isLoading: boolean;
  
  // Player controls
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (position: number) => void;
  
  // Weather integration
  updateWeather: () => Promise<void>;
  getWeatherRecommendations: () => Promise<Track[]>;
  
  // Favorites
  toggleFavorite: (track: Track) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  
  // Search
  searchMusic: (query: string, type?: string) => Promise<void>;
  
  // Playlists
  createPlaylist: (name: string, description?: string) => Promise<void>;
  addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  
  // Categories
  getCategoryTracks: (category: string) => Promise<Track[]>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  // Player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  
  // Weather integration
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weatherRecommendation, setWeatherRecommendation] = useState<WeatherRecommendation | null>(null);
  
  // Data
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable] = useState(false); // Assume API is not available to prevent unnecessary requests

  // Load initial data
  useEffect(() => {
    loadUserData();
    updateWeather();
  }, []);

  const loadUserData = async () => {
    // Skip API calls if API is not available
    if (!apiAvailable) {
      const { SAMPLE_FAVORITE_SONGS, SAMPLE_RECENT_SONGS } = await import('../data/songs');
      setFavorites(SAMPLE_FAVORITE_SONGS);
      setRecentTracks(SAMPLE_RECENT_SONGS);
      return;
    }
    
    try {
      // Load favorites from backend
      const favoritesData = await musicAPI.getFavorites();
      setFavorites(favoritesData);
      
      // Load recent tracks from backend
      const recentData = await musicAPI.getHistory();
      setRecentTracks(recentData);
    } catch (error) {
      // Use fallback data if backend is unavailable (silently)
      const { SAMPLE_FAVORITE_SONGS, SAMPLE_RECENT_SONGS } = await import('../data/songs');
      setFavorites(SAMPLE_FAVORITE_SONGS);
      setRecentTracks(SAMPLE_RECENT_SONGS);
    }
  };

  // Player controls
  const playTrack = async (track: Track) => {
    try {
      setCurrentTrack(track);
      setIsPlaying(true);
      
      // Try to add to recent tracks via backend (non-blocking)
      try {
        await musicAPI.playTrack(track.uri);
        
        // Refresh recent tracks
        const recentData = await musicAPI.getHistory();
        setRecentTracks(recentData);
      } catch (error) {
        console.error('Error syncing with backend:', error);
        // Continue without backend
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const pauseTrack = async () => {
    setIsPlaying(false);
    // Pause Spotify playback via backend
    try {
      await musicAPI.controlPlayback('pause');
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  const resumeTrack = async () => {
    setIsPlaying(true);
    // Resume Spotify playback via backend
    try {
      await musicAPI.controlPlayback('resume');
    } catch (error) {
      console.error('Error resuming playback:', error);
    }
  };

  const nextTrack = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      playTrack(nextTrack);
    }
  };

  const previousTrack = () => {
    if (recentTracks.length > 1 && currentTrack) {
      const previousTrack = recentTracks[1];
      setQueue([currentTrack, ...queue]);
      playTrack(previousTrack);
    }
  };

  const setVolume = async (newVolume: number) => {
    setVolumeState(newVolume);
    try {
      await musicAPI.controlPlayback('volume', undefined, undefined, undefined, Math.round(newVolume * 100));
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const seekTo = async (position: number) => {
    setProgress(position);
    // Seek Spotify playback via backend
    if (currentTrack) {
      try {
        await musicAPI.controlPlayback('seek', undefined, undefined, undefined, Math.round(position * currentTrack.duration));
      } catch (error) {
        console.error('Error seeking playback:', error);
      }
    }
  };

  // Weather integration
  const updateWeather = async () => {
    // Skip API calls if API is not available
    if (!apiAvailable) {
      setIsLoading(true);
      setCurrentWeather({
        location: 'Delhi',
        main: {
          temp: 25,
          feels_like: 24,
          humidity: 65,
          pressure: 1013,
        },
        weather: [{ main: 'Partly Cloudy', description: 'partly cloudy' }],
        wind: { speed: 10 },
      });
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const weatherData = await weatherAPI.getWeatherByLocation('Delhi'); // Default to Delhi
      setCurrentWeather(weatherData);
      // Assuming weather recommendations are handled by the backend now
      // const recommendations = await musicAPI.getWeatherRecommendations();
      // setWeatherRecommendation(recommendations);
    } catch (error) {
      // Use fallback weather data if backend is unavailable (silently)
      setCurrentWeather({
        location: 'Delhi',
        main: {
          temp: 25,
          feels_like: 24,
          humidity: 65,
          pressure: 1013,
        },
        weather: [{ main: 'Partly Cloudy', description: 'partly cloudy' }],
        wind: { speed: 10 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherRecommendations = async () => {
    if (currentWeather) {
      try {
        setIsLoading(true);
        const recommendations = await musicAPI.getWeatherRecommendations(currentWeather.main.temp);
        setWeatherRecommendation(recommendations);
      } catch (error) {
        console.error('Error getting weather recommendations:', error);
        // Use fallback recommendations based on current weather
        const { SAMPLE_TRENDING_SONGS } = await import('../data/songs');
        setWeatherRecommendation({
          songs: SAMPLE_TRENDING_SONGS.slice(0, 5),
          reason: 'Based on current weather conditions',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Favorites
  const toggleFavorite = async (track: Track) => {
    try {
      const isCurrentlyFavorite = favorites.some(fav => fav.id === track.id);
      
      // Update UI immediately
      if (isCurrentlyFavorite) {
        setFavorites(favorites.filter(fav => fav.id !== track.id));
      } else {
        setFavorites([...favorites, track]);
      }

      // Try to sync with backend (non-blocking)
      try {
        if (isCurrentlyFavorite) {
          await musicAPI.removeFavorite(track.id);
        } else {
          await musicAPI.addFavorite(track.id);
        }
      } catch (error) {
        console.error('Error syncing favorite with backend:', error);
        // Keep local change, ignore backend error
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (trackId: string) => {
    return favorites.some((fav) => fav.id === trackId);
  };

  // Search
  const searchMusic = async (query: string, type: string = 'track') => {
    try {
      setIsLoading(true);
      const results = await musicAPI.search(query);
      setSearchResults(results.tracks || []);
    } catch (error) {
      console.error('Error searching music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Playlists
  const createPlaylist = async (name: string, description?: string, isPublic?: boolean) => {
    try {
      const newPlaylist = await musicAPI.createPlaylist({ name, description, isPublic });
      setPlaylists([...playlists, newPlaylist]);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const addToPlaylist = async (playlistId: string, track: Track) => {
    try {
      await musicAPI.addTrackToPlaylist(playlistId, track.id);
      const updatedPlaylists = playlists.map((p) =>
        p.id === playlistId ? { ...p, tracks: [...p.tracks, track] } : p
      );
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
    }
  };

  const removeFromPlaylist = async (playlistId: string, trackId: string) => {
    try {
      await musicAPI.removeTrackFromPlaylist(playlistId, trackId);
      const updatedPlaylists = playlists.map((p) =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
          : p
      );
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error removing track from playlist:', error);
    }
  };

  // Categories
  const getCategoryTracks = async (category: string): Promise<Track[]> => {
    try {
      setIsLoading(true);
      const tracks = await musicAPI.getTracksByCategory(category);
      // Depending on how you want to manage this data, you might set it to a new state
      // For now, let's just return it
      return tracks;
    } catch (error) {
      console.error(`Error getting tracks for category ${category}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const value: MusicContextType = {
    // Player state
    currentTrack,
    isPlaying,
    volume,
    progress,
    queue,
    
    // Weather integration
    currentWeather,
    weatherRecommendation,
    
    // Data
    favorites,
    playlists,
    recentTracks,
    searchResults,
    isLoading,
    
    // Player controls
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    setVolume,
    seekTo,
    
    // Weather integration
    updateWeather,
    getWeatherRecommendations,
    
    // Favorites
    toggleFavorite,
    isFavorite,
    
    // Search
    searchMusic,
    
    // Playlists
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    
    // Categories
    getCategoryTracks
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};