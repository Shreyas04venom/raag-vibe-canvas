import { supabase } from '@/integrations/supabase/client';
import type { Track, Playlist } from '@/types/track';

export async function fetchFavorites(userId: string): Promise<Track[]> {
  const { data } = await supabase.from('favorites').select('track').eq('user_id', userId).order('created_at', { ascending: false });
  return (data ?? []).map((r: any) => r.track as Track);
}
export async function addFavorite(userId: string, track: Track) {
  return supabase.from('favorites').upsert({ user_id: userId, track_id: track.id, track: track as any }, { onConflict: 'user_id,track_id' });
}
export async function removeFavorite(userId: string, trackId: string) {
  return supabase.from('favorites').delete().eq('user_id', userId).eq('track_id', trackId);
}

export async function pushHistory(userId: string, track: Track) {
  return supabase.from('history').insert({ user_id: userId, track_id: track.id, track: track as any });
}
export async function fetchHistory(userId: string, limit = 30): Promise<Track[]> {
  const { data } = await supabase.from('history').select('track').eq('user_id', userId).order('played_at', { ascending: false }).limit(limit);
  const seen = new Set<string>();
  const out: Track[] = [];
  for (const r of data ?? []) {
    const t = (r as any).track as Track;
    if (!seen.has(t.id)) { seen.add(t.id); out.push(t); }
  }
  return out;
}

export async function fetchPlaylists(userId: string): Promise<Playlist[]> {
  const { data } = await supabase.from('playlists').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  return (data ?? []) as any;
}
export async function createPlaylist(userId: string, name: string, description = '', isPublic = false) {
  const { data, error } = await supabase.from('playlists').insert({ user_id: userId, name, description, is_public: isPublic }).select().single();
  if (error) throw error;
  return data as any as Playlist;
}
export async function deletePlaylist(id: string) {
  return supabase.from('playlists').delete().eq('id', id);
}
export async function fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
  const { data } = await supabase.from('playlist_tracks').select('track').eq('playlist_id', playlistId).order('position');
  return (data ?? []).map((r: any) => r.track as Track);
}
export async function addTrackToPlaylist(playlistId: string, track: Track) {
  const { count } = await supabase.from('playlist_tracks').select('*', { count: 'exact', head: true }).eq('playlist_id', playlistId);
  return supabase.from('playlist_tracks').insert({ playlist_id: playlistId, track_id: track.id, track: track as any, position: count ?? 0 });
}
export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  return supabase.from('playlist_tracks').delete().eq('playlist_id', playlistId).eq('track_id', trackId);
}
