import { supabase } from './supabaseClient';

class DatabaseService {
  // Add to history
  async addToHistory(userId: string, trackId: string) {
    const { data, error } = await supabase
      .from('history')
      .insert([{ user_id: userId, track_id: trackId }]);
    if (error) throw error;
    return data;
  }

  // Remove favorite
  async removeFavorite(userId: string, trackId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: userId, track_id: trackId });
    if (error) throw error;
    return data;
  }

  // Add favorite
  async addFavorite(userId: string, trackId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, track_id: trackId }]);
    if (error) throw error;
    return data;
  }

  // Create playlist
  async createPlaylist(userId: string, name: string, description?: string) {
    const { data, error } = await supabase
      .from('playlists')
      .insert([{ user_id: userId, name, description }])
      .select();
    if (error) throw error;
    return { data };
  }

  // Add to playlist
  async addToPlaylist(playlistId: string, trackId: string) {
    const { data, error } = await supabase
      .from('playlist_tracks')
      .insert([{ playlist_id: playlistId, track_id: trackId }]);
    if (error) throw error;
    return data;
  }

  // Remove from playlist
  async removeFromPlaylist(playlistId: string, trackId: string) {
    const { data, error } = await supabase
      .from('playlist_tracks')
      .delete()
      .match({ playlist_id: playlistId, track_id: trackId });
    if (error) throw error;
    return data;
  }

  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('track_id')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  async getHistory(userId: string) {
    const { data, error } = await supabase
      .from('history')
      .select('track_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  }
}

export const db = new DatabaseService();