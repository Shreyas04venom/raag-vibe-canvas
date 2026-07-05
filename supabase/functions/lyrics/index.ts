import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const artist = url.searchParams.get('artist') ?? '';
    const title = url.searchParams.get('title') ?? '';
    if (!artist || !title) return new Response(JSON.stringify({ lyrics: '' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    const data = await r.json().catch(() => ({}));
    return new Response(JSON.stringify({ lyrics: data.lyrics ?? '' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ lyrics: '', error: String(e) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
