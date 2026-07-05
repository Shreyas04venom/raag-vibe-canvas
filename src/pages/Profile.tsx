import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Save } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const { profile, updateProfile, signOut, user } = useAuth();
  const { favorites, playlists, history } = useLibrary();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? '');

  const save = () => updateProfile({ display_name: name, bio, avatar_url: avatar });

  return (
    <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
      <Navigation />
      <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="glass rounded-3xl p-6 text-center">
          <Avatar className="w-28 h-28 mx-auto mb-4 ring-4 ring-primary/50">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent">{(name || 'U')[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{name || 'Music Lover'}</h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
          {bio && <p className="mt-2 text-sm">{bio}</p>}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Stat label="Favorites" value={favorites.length} />
            <Stat label="Playlists" value={playlists.length} />
            <Stat label="Played" value={history.length} />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Avatar URL</Label><Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." /></div>
          <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} /></div>
          <Button onClick={save} className="gap-2"><Save className="w-4 h-4" />Save</Button>
        </div>

        <Button variant="outline" onClick={signOut} className="gap-2 w-full"><LogOut className="w-4 h-4" />Sign out</Button>
      </main>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return <div><p className="text-2xl font-bold gradient-text">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}
