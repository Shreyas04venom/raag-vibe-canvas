import { useState } from 'react';
import Navigation from '@/components/Navigation';
import TrackCard from '@/components/TrackCard';
import { useLibrary } from '@/contexts/LibraryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Heart, Clock, Music2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Library() {
  const { favorites, history, playlists, createPlaylist, deletePlaylist } = useLibrary();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [pub, setPub] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    await createPlaylist(name, desc, pub);
    setName(''); setDesc(''); setPub(false); setOpen(false);
  };

  return (
    <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
      <Navigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-text">Your Library</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />New Playlist</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a playlist</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My awesome mix" /></div>
                <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional" /></div>
                <div className="flex items-center gap-3"><Switch checked={pub} onCheckedChange={setPub} /><Label>Public</Label></div>
              </div>
              <DialogFooter><Button onClick={submit}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="playlists">
          <TabsList className="mb-6">
            <TabsTrigger value="playlists"><Music2 className="w-4 h-4 mr-2" />Playlists</TabsTrigger>
            <TabsTrigger value="favorites"><Heart className="w-4 h-4 mr-2" />Favorites</TabsTrigger>
            <TabsTrigger value="history"><Clock className="w-4 h-4 mr-2" />Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="playlists">
            {playlists.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No playlists yet. Create one!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((p) => (
                  <motion.div key={p.id} whileHover={{ y: -4 }} className="glass rounded-2xl p-4 group relative">
                    <Link to={`/playlist/${p.id}`}>
                      <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/60 to-accent/60 mb-3 flex items-center justify-center">
                        <Music2 className="w-16 h-16 text-white/70" />
                      </div>
                      <p className="font-semibold truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.is_public ? 'Public' : 'Private'}</p>
                    </Link>
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => deletePlaylist(p.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {favorites.length === 0 ? <p className="text-center text-muted-foreground py-16">No favorites yet. Tap ❤️ on any song.</p> : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favorites.map((t) => <TrackCard key={t.id} track={t} queue={favorites} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {history.length === 0 ? <p className="text-center text-muted-foreground py-16">Nothing played yet.</p> : (
              <div className="space-y-1">
                {history.map((t) => <TrackCard key={t.id} track={t} queue={history} compact />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
