import type { Track } from '@/types/track';

const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
const HEADERS = { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY };

export async function searchMusic(query: string, limit = 25): Promise<Track[]> {
  if (!query.trim()) return [];
  try {
    const r = await fetch(`${FN_URL}/music-search?q=${encodeURIComponent(query)}&limit=${limit}`, { headers: HEADERS });
    const data = await r.json();
    return data.tracks ?? [];
  } catch (e) {
    console.error('searchMusic', e);
    return [];
  }
}

export async function getLyrics(artist: string, title: string): Promise<string> {
  try {
    const r = await fetch(`${FN_URL}/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`, { headers: HEADERS });
    const data = await r.json();
    return data.lyrics ?? '';
  } catch {
    return '';
  }
}

export async function aiRecommend(weather: string, mood: string, recentArtists: string[] = []) {
  try {
    const r = await fetch(`${FN_URL}/ai-recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...HEADERS },
      body: JSON.stringify({ weather, mood, recentArtists }),
    });
    return await r.json();
  } catch {
    return { queries: [], greeting: '', tagline: '' };
  }
}

// Curated genre queries for quick browse
export const GENRES: { id: string; name: string; query: string; gradient: string }[] = [
  { id: 'bollywood', name: 'Bollywood', query: 'bollywood hits', gradient: 'from-pink-500 to-orange-500' },
  { id: 'punjabi', name: 'Punjabi', query: 'punjabi hits', gradient: 'from-yellow-500 to-red-500' },
  { id: 'sufi', name: 'Sufi', query: 'sufi hindi', gradient: 'from-purple-500 to-indigo-600' },
  { id: 'classical', name: 'Classical', query: 'indian classical raga', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'devotional', name: 'Devotional', query: 'bhajan devotional', gradient: 'from-amber-500 to-orange-600' },
  { id: 'indie', name: 'Indie', query: 'indian indie', gradient: 'from-rose-500 to-fuchsia-600' },
  { id: 'lofi', name: 'Lo-fi', query: 'lofi hindi chill', gradient: 'from-sky-500 to-blue-600' },
  { id: 'pop', name: 'Pop', query: 'pop hits 2024', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'rock', name: 'Rock', query: 'rock anthems', gradient: 'from-slate-600 to-zinc-700' },
  { id: 'edm', name: 'EDM', query: 'edm party mix', gradient: 'from-violet-500 to-purple-600' },
];
