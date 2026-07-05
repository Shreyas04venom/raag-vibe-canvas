import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import WeatherHero from '@/components/WeatherHero';
import TrackCard from '@/components/TrackCard';
import { useWeather } from '@/contexts/WeatherContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { searchMusic, aiRecommend, GENRES } from '@/services/music.service';
import type { Track } from '@/types/track';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Home() {
  const { weather } = useWeather();
  const { history, favorites } = useLibrary();
  const { profile } = useAuth();
  const [weatherMix, setWeatherMix] = useState<Track[]>([]);
  const [trending, setTrending] = useState<Track[]>([]);
  const [greeting, setGreeting] = useState<string>('Welcome to RaagWeather');
  const [tagline, setTagline] = useState<string>('Music tuned to your sky');

  useEffect(() => {
    searchMusic('top hits 2024', 20).then(setTrending);
  }, []);

  useEffect(() => {
    if (!weather) return;
    searchMusic(weather.musicQuery, 20).then(setWeatherMix);
    aiRecommend(weather.condition, weather.mood, favorites.slice(0, 5).map((f) => f.artist))
      .then((r) => { if (r?.greeting) setGreeting(r.greeting); if (r?.tagline) setTagline(r.tagline); });
  }, [weather]);

  return (
    <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
      <Navigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Hey {profile?.display_name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-muted-foreground italic">{tagline}</p>
        </motion.div>

        <WeatherHero />

        {weather && weatherMix.length > 0 && (
          <Section title={`${weather.emoji} ${greeting}`} subtitle={`Curated for the ${weather.condition.toLowerCase()} in ${weather.city}`}>
            <Row tracks={weatherMix} />
          </Section>
        )}

        <Section title="Browse by Mood">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {GENRES.map((g) => (
              <Link key={g.id} to={`/search?q=${encodeURIComponent(g.query)}`}>
                <motion.div whileHover={{ scale: 1.03 }} className={`aspect-video rounded-2xl bg-gradient-to-br ${g.gradient} p-4 flex items-end shadow-lg`}>
                  <span className="text-lg font-bold text-white drop-shadow">{g.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </Section>

        {history.length > 0 && (
          <Section title="Recently Played">
            <Row tracks={history} />
          </Section>
        )}

        {favorites.length > 0 && (
          <Section title="Your Favorites">
            <Row tracks={favorites.slice(0, 20)} />
          </Section>
        )}

        <Section title="🔥 Trending Now" link="/search?q=top hits 2024">
          <Row tracks={trending} />
        </Section>
      </main>
    </div>
  );
}

function Section({ title, subtitle, link, children }: { title: string; subtitle?: string; link?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {link && <Link to={link} className="text-sm text-primary flex items-center gap-1 hover:underline">See all <ChevronRight className="w-4 h-4" /></Link>}
      </div>
      {children}
    </section>
  );
}

function Row({ tracks }: { tracks: Track[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
      {tracks.slice(0, 15).map((t) => (
        <div key={t.id} className="w-40 md:w-auto flex-shrink-0 snap-start">
          <TrackCard track={t} queue={tracks} />
        </div>
      ))}
    </div>
  );
}
