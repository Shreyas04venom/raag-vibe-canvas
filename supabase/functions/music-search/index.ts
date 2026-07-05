// Music search: Piped (YouTube) for full songs + iTunes fallback for previews.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  previewUrl: string;
  duration: number;
  source: 'youtube' | 'itunes';
  videoId?: string;
}

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.reallyaweso.me',
  'https://pipedapi.adminforge.de',
  'https://api-piped.mha.fi',
  'https://pipedapi.leptons.xyz',
  'https://pipedapi.drgns.space',
];

function extractVideoId(u: string): string | null {
  if (!u) return null;
  const m = u.match(/[?&]v=([\w-]{6,})/);
  if (m) return m[1];
  const m2 = u.match(/\/(?:watch|shorts|embed)\/([\w-]{6,})/);
  if (m2) return m2[1];
  return null;
}

async function pipedSearch(q: string, limit: number): Promise<Track[]> {
  for (const base of PIPED_INSTANCES) {
    try {
      const url = `${base}/search?q=${encodeURIComponent(q)}&filter=music_songs`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4500);
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) continue;
      const data = await r.json();
      const items = (data.items ?? []) as any[];
      const out: Track[] = [];
      for (const it of items) {
        if (out.length >= limit) break;
        if (it.type && it.type !== 'stream') continue;
        const vid = extractVideoId(it.url ?? '');
        if (!vid) continue;
        if (typeof it.duration === 'number' && it.duration > 60 * 20) continue; // skip long non-song clips
        out.push({
          id: `yt-${vid}`,
          name: it.title ?? 'Unknown',
          artist: it.uploaderName ?? 'Unknown',
          album: '',
          image: it.thumbnail ?? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
          previewUrl: '',
          duration: it.duration ?? 0,
          source: 'youtube',
          videoId: vid,
        });
      }
      if (out.length) return out;
    } catch (_) { /* try next */ }
  }
  return [];
}

function itunesNormalize(r: any): Track | null {
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

async function itunesSearch(q: string, limit: number, country: string): Promise<Track[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=${limit}&country=${country}`;
    const r = await fetch(url);
    const data = await r.json();
    return (data.results ?? []).map(itunesNormalize).filter(Boolean) as Track[];
  } catch {
    return [];
  }
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

    // Try YouTube (full songs) first, iTunes as fallback / enrichment
    const [yt, it] = await Promise.all([pipedSearch(q, limit), itunesSearch(q, Math.min(15, limit), country)]);

    // Enrich YT tracks with iTunes cover art / album when title matches roughly
    const enriched = yt.map((t) => {
      const match = it.find((x) => {
        const a = t.name.toLowerCase();
        const b = x.name.toLowerCase();
        return a.includes(b) || b.includes(a);
      });
      if (match) return { ...t, album: match.album, image: match.image || t.image };
      return t;
    });

    const tracks = enriched.length ? enriched : it;
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
