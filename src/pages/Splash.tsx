import { motion } from 'framer-motion';
import { Music2, Cloud, Sparkles } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Splash() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-background via-primary/30 to-accent/30 relative overflow-hidden">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/40 rounded-full blur-3xl" />
      <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/40 rounded-full blur-3xl" />

      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }} className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 glow-primary">
        <Music2 className="w-14 h-14" />
        <Cloud className="absolute -top-3 -right-3 w-8 h-8 text-secondary" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-6xl font-bold gradient-text mb-2">RaagWeather</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-lg text-muted-foreground mb-8 max-w-md">Music tuned to your sky. Weather-aware playlists, listening parties, and endless discovery.</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-3">
        <Link to="/auth"><Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 glow-primary"><Sparkles className="w-4 h-4" />Get started</Button></Link>
        <Link to="/auth"><Button size="lg" variant="outline">Sign in</Button></Link>
      </motion.div>
    </div>
  );
}
