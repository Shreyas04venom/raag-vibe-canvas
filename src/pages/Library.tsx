import { motion } from "framer-motion";
import { Heart, Clock, ListMusic, Plus, ArrowLeft, Edit2, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import SongCard from "@/components/SongCard";
import MiniPlayer from "@/components/MiniPlayer";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useMusic } from "@/contexts/MusicContext";
import { SAMPLE_FAVORITE_SONGS, SAMPLE_RECENT_SONGS } from "../data/songs";

// All song data is now imported from data/songs.ts

export default function Library() {
  const [searchParams] = useSearchParams();
  const [showPlayer, setShowPlayer] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState<any>(null);
  const [playlists, setPlaylists] = useState([
    { id: 1, title: "Rainy Day Mix", count: 24, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
    { id: 2, title: "Workout Beats", count: 18, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
  ]);
  
  const tabParam = searchParams.get('tab') || 'playlists';
  const defaultTab = ['playlists', 'favorites', 'recent'].includes(tabParam) ? tabParam : 'playlists';
  
  const { currentTrack, favorites: contextFavorites, recentTracks, playTrack, isFavorite, toggleFavorite } = useMusic();

  const favoriteSongs = contextFavorites?.length ? contextFavorites : SAMPLE_FAVORITE_SONGS;
  const recentSongs = recentTracks?.length ? recentTracks : SAMPLE_RECENT_SONGS;

  const handleCreatePlaylist = () => {
    if (playlistName.trim()) {
      const newPlaylist = {
        id: playlists.length + 1,
        title: playlistName,
        count: 0,
        cover: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop'
      };
      setPlaylists([...playlists, newPlaylist]);
      setPlaylistName('');
      setPlaylistDesc('');
      setShowCreateDialog(false);
    }
  };

  const handleEditPlaylist = (playlist: any) => {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist.title);
    setPlaylistDesc('');
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (playlistName.trim() && editingPlaylist) {
      setPlaylists(playlists.map(p => 
        p.id === editingPlaylist.id 
          ? { ...p, title: playlistName }
          : p
      ));
      setPlaylistName('');
      setPlaylistDesc('');
      setEditingPlaylist(null);
      setShowEditDialog(false);
    }
  };

  const handleDeletePlaylist = (id: number) => {
    setPlaylists(playlists.filter(p => p.id !== id));
  };

  const handleSharePlaylist = (playlist: any) => {
    const shareUrl = `${window.location.origin}/library?playlist=${playlist.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Playlist link copied to clipboard!\n${shareUrl}`);
  };

  return (
    <div className="min-h-screen pb-32 lg:pb-24">
      <Navigation />

      <main className="lg:ml-64 p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-primary/30 hover:bg-primary/10"
                >
                  <ArrowLeft className="w-5 h-5 text-primary" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-2">
                  Your Library
                </h1>
                <p className="text-muted-foreground text-lg">
                  All your music in one place
                </p>
              </div>
            </div>

            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Playlist
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="glass mb-8">
              <TabsTrigger value="playlists" className="gap-2">
                <ListMusic className="w-4 h-4" />
                Playlists
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="w-4 h-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="w-4 h-4" />
                Recently Played
              </TabsTrigger>
            </TabsList>

            <TabsContent value="playlists">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index, duration: 0.5 }}
                  >
                    <SongCard
                      title={playlist.title}
                      artist={`${playlist.count} songs`}
                      albumArt={playlist.cover}
                      onPlay={() => { setShowPlayer(true); }}
                      onLike={() => {}}
                      onEdit={() => handleEditPlaylist(playlist)}
                      onShare={() => handleSharePlaylist(playlist)}
                      onDelete={() => handleDeletePlaylist(playlist.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {favoriteSongs.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index, duration: 0.5 }}
                  >
                    <SongCard
                      title={song.name}
                      artist={song.artist}
                      albumArt={song.image}
                      duration={typeof song.duration === 'number' ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : song.duration}
                      isLiked={isFavorite(song.id)}
                      onPlay={() => { playTrack(song); setShowPlayer(true); }}
                      onLike={() => toggleFavorite(song)}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recentSongs.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index, duration: 0.5 }}
                  >
                    <SongCard
                      title={song.name}
                      artist={song.artist}
                      albumArt={song.image}
                      duration={typeof song.duration === 'number' ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : song.duration}
                      isLiked={isFavorite(song.id)}
                      onPlay={() => { playTrack(song); setShowPlayer(true); }}
                      onLike={() => toggleFavorite(song)}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>Add a new playlist to your library</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Playlist Name</label>
              <Input
                placeholder="e.g., Summer Vibes"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                className="bg-white/10 border-white/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                placeholder="Describe your playlist..."
                value={playlistDesc}
                onChange={(e) => setPlaylistDesc(e.target.value)}
                className="bg-white/10 border-white/20 min-h-24"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setPlaylistName('');
                  setPlaylistDesc('');
                }}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Playlist Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
            <DialogDescription>Update your playlist details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Playlist Name</label>
              <Input
                placeholder="Enter playlist name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="bg-white/10 border-white/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                placeholder="Describe your playlist..."
                value={playlistDesc}
                onChange={(e) => setPlaylistDesc(e.target.value)}
                className="bg-white/10 border-white/20 min-h-24"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setPlaylistName('');
                  setPlaylistDesc('');
                  setEditingPlaylist(null);
                }}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MiniPlayer
        isVisible={showPlayer && !!currentTrack}
        currentSong={currentTrack ? {
          title: currentTrack.name,
          artist: currentTrack.artist,
          albumArt: currentTrack.image,
        } : undefined}
      />
    </div>
  );
}
