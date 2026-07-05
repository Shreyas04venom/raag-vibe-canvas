import type { WeatherData } from '@/types/track';

const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
const HEADERS = { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY };

export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const r = await fetch(`${FN_URL}/weather?lat=${lat}&lon=${lon}`, { headers: HEADERS });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function getWeatherByCity(city: string): Promise<WeatherData | null> {
  try {
    const r = await fetch(`${FN_URL}/weather?city=${encodeURIComponent(city)}`, { headers: HEADERS });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export function requestGeoWeather(): Promise<WeatherData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(getWeatherByCity('Mumbai'));
    navigator.geolocation.getCurrentPosition(
      async (pos) => resolve(await getWeatherByCoords(pos.coords.latitude, pos.coords.longitude)),
      async () => resolve(await getWeatherByCity('Mumbai')),
      { timeout: 5000 },
    );
  });
}
