import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) throw new Error('LOVABLE_API_KEY missing');
    const { weather, mood, recentArtists } = await req.json();
    const prompt = `Weather: ${weather}. Mood: ${mood}. Recent artists: ${(recentArtists ?? []).join(', ') || 'none'}.
Return JSON: {"greeting":"warm 1-line greeting","queries":["5 music search queries suited to this weather & mood, mix of Bollywood, indie, English"],"tagline":"short poetic tagline"}`;
    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a music curator for RaagWeather. Respond ONLY with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: t }), { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { queries: [] }; }
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), queries: [] }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
