import { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Song } from './PlayerContext';

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
}

interface PlaylistContextType {
  playlists: Playlist[];
  favorites: Song[];
  recentlyPlayed: Song[];
  createPlaylist: (title: string, description?: string) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  reorderPlaylistSongs: (playlistId: string, startIndex: number, endIndex: number) => void;
  toggleFavorite: (song: Song) => void;
  isFavorite: (songId: string) => boolean;
  addToRecent: (song: Song) => void;
  clearRecent: () => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const { toast } = useToast();

  const createPlaylist = (title: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title,
      description,
      songs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPlaylists([...playlists, newPlaylist]);
    
    toast({
      title: 'Playlist Created',
      description: `"${title}" has been created.`,
    });
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    setPlaylists(playlists.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
    
    toast({
      title: 'Playlist Updated',
      description: 'Your changes have been saved.',
    });
  };

  const deletePlaylist = (id: string) => {
    const playlist = playlists.find(p => p.id === id);
    setPlaylists(playlists.filter(p => p.id !== id));
    
    toast({
      title: 'Playlist Deleted',
      description: `"${playlist?.title}" has been deleted.`,
    });
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        // Check if song already exists
        if (p.songs.some(s => s.id === song.id)) {
          toast({
            title: 'Already in Playlist',
            description: `${song.title} is already in ${p.title}`,
            variant: 'destructive',
          });
          return p;
        }
        
        toast({
          title: 'Added to Playlist',
          description: `${song.title} added to ${p.title}`,
        });
        
        return {
          ...p,
          songs: [...p.songs, song],
          updatedAt: new Date(),
        };
      }
      return p;
    }));
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId
        ? { ...p, songs: p.songs.filter(s => s.id !== songId), updatedAt: new Date() }
        : p
    ));
    
    toast({
      title: 'Removed',
      description: 'Song removed from playlist',
    });
  };

  const reorderPlaylistSongs = (playlistId: string, startIndex: number, endIndex: number) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        const newSongs = Array.from(p.songs);
        const [removed] = newSongs.splice(startIndex, 1);
        newSongs.splice(endIndex, 0, removed);
        return { ...p, songs: newSongs, updatedAt: new Date() };
      }
      return p;
    }));
  };

  const toggleFavorite = (song: Song) => {
    if (favorites.some(s => s.id === song.id)) {
      setFavorites(favorites.filter(s => s.id !== song.id));
      toast({
        title: 'Removed from Favorites',
        description: `${song.title} removed from favorites`,
      });
    } else {
      setFavorites([...favorites, song]);
      toast({
        title: 'Added to Favorites',
        description: `${song.title} added to favorites`,
      });
    }
  };

  const isFavorite = (songId: string) => {
    return favorites.some(s => s.id === songId);
  };

  const addToRecent = (song: Song) => {
    // Add to front, remove duplicates, limit to 50
    const filtered = recentlyPlayed.filter(s => s.id !== song.id);
    setRecentlyPlayed([song, ...filtered].slice(0, 50));
  };

  const clearRecent = () => {
    setRecentlyPlayed([]);
    toast({
      title: 'History Cleared',
      description: 'Your listening history has been cleared',
    });
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        favorites,
        recentlyPlayed,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        reorderPlaylistSongs,
        toggleFavorite,
        isFavorite,
        addToRecent,
        clearRecent,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
}
