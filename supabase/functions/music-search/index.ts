// Music search proxy: iTunes Search API (free, no key, returns previewUrl MP3s)
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  previewUrl: string;
  duration: number;
  source: 'itunes';
}

function normalize(r: any): Track | null {
  if (!r?.previewUrl) return null;
  return {
    id: `itunes-${r.trackId}`,
    name: r.trackName ?? 'Unknown',
    artist: r.artistName ?? 'Unknown',
    album: r.collectionName ?? '',
    image: (r.artworkUrl100 || r.artworkUrl60 || '').replace('100x100', '600x600'),
    previewUrl: r.previewUrl,
    duration: Math.round((r.trackTimeMillis ?? 30000) / 1000),
    source: 'itunes',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') ?? '';
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '25'), 50);
    const country = url.searchParams.get('country') ?? 'IN';
    if (!q.trim()) {
      return new Response(JSON.stringify({ tracks: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=${limit}&country=${country}`;
    const resp = await fetch(itunesUrl);
    const data = await resp.json();
    const tracks = (data.results ?? []).map(normalize).filter(Boolean);
    return new Response(JSON.stringify({ tracks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), tracks: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
