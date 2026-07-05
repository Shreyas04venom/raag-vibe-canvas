import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { Track, Playlist } from '@/types/track';
import { useAuth } from './AuthContext';
import * as lib from '@/services/library.service';
import { toast } from 'sonner';

interface LibraryCtx {
  favorites: Track[];
  history: Track[];
  playlists: Playlist[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (t: Track) => void;
  refresh: () => Promise<void>;
  createPlaylist: (name: string, description?: string, isPublic?: boolean) => Promise<Playlist | null>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, t: Track) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  playlistTracks: (playlistId: string) => Promise<Track[]>;
}

const Ctx = createContext<LibraryCtx | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const refresh = useCallback(async () => {
    if (!user) { setFavorites([]); setHistory([]); setPlaylists([]); return; }
    const [f, h, p] = await Promise.all([
      lib.fetchFavorites(user.id),
      lib.fetchHistory(user.id),
      lib.fetchPlaylists(user.id),
    ]);
    setFavorites(f); setHistory(h); setPlaylists(p);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);
  const toggleFavorite = async (t: Track) => {
    if (!user) return toast.error('Sign in to save favorites');
    if (isFavorite(t.id)) {
      await lib.removeFavorite(user.id, t.id);
      setFavorites((f) => f.filter((x) => x.id !== t.id));
      toast.success('Removed from favorites');
    } else {
      await lib.addFavorite(user.id, t);
      setFavorites((f) => [t, ...f]);
      toast.success('Added to favorites ❤️');
    }
  };

  const createPlaylist = async (name: string, description = '', isPublic = false) => {
    if (!user) { toast.error('Sign in first'); return null; }
    try {
      const p = await lib.createPlaylist(user.id, name, description, isPublic);
      setPlaylists((ps) => [p, ...ps]);
      toast.success('Playlist created');
      return p;
    } catch (e: any) { toast.error(e.message); return null; }
  };
  const deletePlaylist = async (id: string) => {
    await lib.deletePlaylist(id);
    setPlaylists((ps) => ps.filter((p) => p.id !== id));
    toast.success('Playlist deleted');
  };
  const addToPlaylist = async (playlistId: string, t: Track) => {
    await lib.addTrackToPlaylist(playlistId, t);
    toast.success('Added to playlist');
  };
  const removeFromPlaylist = async (playlistId: string, trackId: string) => {
    await lib.removeTrackFromPlaylist(playlistId, trackId);
    toast.success('Removed');
  };
  const playlistTracks = (id: string) => lib.fetchPlaylistTracks(id);

  return (
    <Ctx.Provider value={{
      favorites, history, playlists, isFavorite, toggleFavorite, refresh,
      createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, playlistTracks,
    }}>{children}</Ctx.Provider>
  );
}

export const useLibrary = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLibrary outside provider');
  return c;
};
