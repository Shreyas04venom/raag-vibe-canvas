import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useWeather } from '@/contexts/WeatherContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, MapPin, Volume2, Moon, Timer } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { signOut } = useAuth();
  const { volume, setVolume, sleepIn, sleepRemaining } = usePlayer();
  const { setCity } = useWeather();
  const [city, setCityInput] = useState('');
  const [sleep, setSleep] = useState<string>('off');

  const applySleep = (v: string) => {
    setSleep(v);
    sleepIn(v === 'off' ? null : parseInt(v));
  };

  return (
    <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
      <Navigation />
      <main className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>

        <Section icon={<Volume2 className="w-5 h-5" />} title="Audio">
          <Label>Volume ({Math.round(volume * 100)}%)</Label>
          <Slider value={[volume * 100]} max={100} onValueChange={([v]) => setVolume(v / 100)} />
        </Section>

        <Section icon={<MapPin className="w-5 h-5" />} title="Weather location">
          <div className="flex gap-2">
            <Input value={city} onChange={(e) => setCityInput(e.target.value)} placeholder="e.g. Mumbai" />
            <Button onClick={() => { if (city) setCity(city); }}>Set</Button>
          </div>
        </Section>

        <Section icon={<Timer className="w-5 h-5" />} title="Sleep timer">
          <Select value={sleep} onValueChange={applySleep}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
          {sleepRemaining != null && <p className="text-xs text-muted-foreground mt-2">Stopping in {Math.floor(sleepRemaining / 60)}:{String(sleepRemaining % 60).padStart(2, '0')}</p>}
        </Section>

        <Section icon={<Moon className="w-5 h-5" />} title="About">
          <p className="text-sm text-muted-foreground">RaagWeather v1.0 — Music tuned to your sky. Preview clips are 30s from iTunes.</p>
        </Section>

        <Button variant="outline" className="w-full gap-2" onClick={signOut}><LogOut className="w-4 h-4" />Sign out</Button>
      </main>
    </div>
  );
}
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-primary">{icon}<h2 className="font-semibold">{title}</h2></div>
      {children}
    </div>
  );
}
