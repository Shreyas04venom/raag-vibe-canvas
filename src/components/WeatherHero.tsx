import { motion } from 'framer-motion';
import { useWeather } from '@/contexts/WeatherContext';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Zap, Wind, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ICONS: Record<string, any> = {
  Clear: Sun, Clouds: Cloud, Rain: CloudRain, Drizzle: CloudDrizzle, Snow: CloudSnow, Thunderstorm: Zap, Mist: Wind, Haze: Wind, Fog: Wind,
};

export default function WeatherHero() {
  const { weather, loading, refresh } = useWeather();
  const Icon = weather ? (ICONS[weather.condition] ?? Cloud) : Cloud;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden border border-white/10"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-10 w-32 bg-white/10 rounded" />
              <div className="h-4 w-48 bg-white/10 rounded" />
            </div>
          ) : weather ? (
            <>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
                <MapPin className="w-3 h-3" />{weather.city}{weather.country ? `, ${weather.country}` : ''}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-bold">{weather.temp}°</span>
                <span className="text-xl">{weather.emoji}</span>
              </div>
              <p className="text-lg capitalize font-medium mt-1">{weather.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Feels {weather.feelsLike}° • {weather.humidity}% humidity • {weather.wind} m/s wind
              </p>
              <p className="text-sm text-primary mt-3 italic">
                Perfect for <span className="font-semibold">{weather.mood}</span> vibes ✨
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Weather unavailable</p>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Icon className="w-16 h-16 md:w-20 md:h-20 text-primary" />
          </motion.div>
          <Button size="icon" variant="ghost" onClick={refresh}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>
    </motion.div>
  );
}
