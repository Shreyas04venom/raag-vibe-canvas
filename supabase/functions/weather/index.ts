import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const MOOD_MAP: Record<string, { mood: string; query: string; emoji: string }> = {
  Thunderstorm: { mood: 'intense', query: 'epic dramatic bollywood', emoji: '⛈️' },
  Drizzle: { mood: 'chill', query: 'monsoon melodies hindi', emoji: '🌦️' },
  Rain: { mood: 'romantic', query: 'monsoon romantic hindi', emoji: '🌧️' },
  Snow: { mood: 'cozy', query: 'peaceful acoustic', emoji: '❄️' },
  Clear: { mood: 'happy', query: 'bollywood upbeat happy', emoji: '☀️' },
  Clouds: { mood: 'reflective', query: 'sufi soulful hindi', emoji: '☁️' },
  Mist: { mood: 'dreamy', query: 'lofi hindi chill', emoji: '🌫️' },
  Haze: { mood: 'dreamy', query: 'lofi hindi chill', emoji: '🌫️' },
  Fog: { mood: 'dreamy', query: 'ambient instrumental', emoji: '🌫️' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const key = Deno.env.get('OPENWEATHER_API_KEY');
    if (!key) throw new Error('OPENWEATHER_API_KEY missing');
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const city = url.searchParams.get('city');
    const qs = lat && lon
      ? `lat=${lat}&lon=${lon}`
      : `q=${encodeURIComponent(city ?? 'Mumbai')}`;
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?${qs}&units=metric&appid=${key}`);
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: t }), { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const w = await resp.json();
    const main = w.weather?.[0]?.main ?? 'Clear';
    const mood = MOOD_MAP[main] ?? MOOD_MAP.Clear;
    const out = {
      city: w.name,
      country: w.sys?.country,
      temp: Math.round(w.main?.temp),
      feelsLike: Math.round(w.main?.feels_like),
      humidity: w.main?.humidity,
      wind: w.wind?.speed,
      condition: main,
      description: w.weather?.[0]?.description,
      icon: w.weather?.[0]?.icon,
      sunrise: w.sys?.sunrise,
      sunset: w.sys?.sunset,
      mood: mood.mood,
      musicQuery: mood.query,
      emoji: mood.emoji,
    };
    return new Response(JSON.stringify(out), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
