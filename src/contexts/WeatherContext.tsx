import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { WeatherData } from '@/types/track';
import { requestGeoWeather, getWeatherByCity } from '@/services/weather.service';

interface WCtx {
  weather: WeatherData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setCity: (city: string) => Promise<void>;
}
const Ctx = createContext<WCtx | null>(null);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const w = await requestGeoWeather();
    setWeather(w);
    setLoading(false);
  }
  async function setCity(city: string) {
    setLoading(true);
    const w = await getWeatherByCity(city);
    if (w) setWeather(w);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  return <Ctx.Provider value={{ weather, loading, refresh, setCity }}>{children}</Ctx.Provider>;
}
export const useWeather = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useWeather outside provider');
  return c;
};
