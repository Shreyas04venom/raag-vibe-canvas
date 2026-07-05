import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, User, Users, Music2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/party', icon: Users, label: 'Party' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Navigation() {
  const loc = useLocation();
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/10 flex-col p-6 z-30">
        <Link to="/home" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text">RaagWeather</h1>
            <p className="text-[10px] text-muted-foreground -mt-1">Music × Sky</p>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const active = loc.pathname === it.to || (it.to !== '/home' && loc.pathname.startsWith(it.to));
            return (
              <Link key={it.to} to={it.to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${active ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-foreground/70'}`}>
                <it.icon className="w-5 h-5" />
                <span className="font-medium">{it.label}</span>
                {active && <motion.div layoutId="nav-dot" className="ml-auto w-2 h-2 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto glass rounded-2xl p-4 border border-primary/30">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-primary" /><p className="text-xs font-semibold">Pro tip</p></div>
          <p className="text-xs text-muted-foreground">Press ⌘K to search anything instantly.</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/10 flex justify-around py-2">
        {items.map((it) => {
          const active = loc.pathname === it.to;
          return (
            <Link key={it.to} to={it.to} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <it.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
