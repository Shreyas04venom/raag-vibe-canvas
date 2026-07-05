import { useEffect, useState } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Library, User, Settings as SettingsIcon, Music2, Users } from 'lucide-react';
import { searchMusic } from '@/services/music.service';
import type { Track } from '@/types/track';
import { usePlayer } from '@/contexts/PlayerContext';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const nav = useNavigate();
  const { play } = usePlayer();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(() => searchMusic(q, 8).then(setResults), 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search music, jump to a page… (⌘K)" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Songs">
            {results.map((t) => (
              <CommandItem key={t.id} onSelect={() => { play(t, results); setOpen(false); }}>
                <Music2 className="w-4 h-4 mr-2" />{t.name} <span className="text-muted-foreground ml-2">— {t.artist}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => { nav('/home'); setOpen(false); }}><Home className="w-4 h-4 mr-2" />Home</CommandItem>
          <CommandItem onSelect={() => { nav('/search'); setOpen(false); }}><Search className="w-4 h-4 mr-2" />Search</CommandItem>
          <CommandItem onSelect={() => { nav('/library'); setOpen(false); }}><Library className="w-4 h-4 mr-2" />Library</CommandItem>
          <CommandItem onSelect={() => { nav('/party'); setOpen(false); }}><Users className="w-4 h-4 mr-2" />Party</CommandItem>
          <CommandItem onSelect={() => { nav('/profile'); setOpen(false); }}><User className="w-4 h-4 mr-2" />Profile</CommandItem>
          <CommandItem onSelect={() => { nav('/settings'); setOpen(false); }}><SettingsIcon className="w-4 h-4 mr-2" />Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
