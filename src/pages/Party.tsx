// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useParty } from '../contexts/PartyContext';
import { useMusic } from '../contexts/MusicContext';
import { motion } from 'framer-motion';
import { Music, Users, Send, X, Radio, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SAMPLE_TRENDING_SONGS, SAMPLE_RECENT_SONGS, SAMPLE_FAVORITE_SONGS, Song } from '../data/songs';

const Party: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const { party, joinParty, leaveParty, messages, sendMessage, currentUserName } = useParty();
  const { currentTrack, isPlaying, progress, volume, playTrack, pauseTrack, resumeTrack, seekTo, setVolume } = useMusic();
  const [message, setMessage] = useState('');
  const [showSongDialog, setShowSongDialog] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  
  // Combine all songs
  const allSongs = [...SAMPLE_TRENDING_SONGS, ...SAMPLE_RECENT_SONGS, ...SAMPLE_FAVORITE_SONGS];
  // Remove duplicates by ID
  const uniqueSongs = Array.from(new Map(allSongs.map(song => [song.id, song])).values());

  useEffect(() => {
    if (partyId) {
      joinParty(partyId);
    }
    return () => {
      leaveParty();
    };
  }, [partyId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handlePlaySong = (song: Song) => {
    setSelectedSong(song);
    playTrack(song as any);
    setShowSongDialog(false);
  };

  const isPartyCreator = party && party.createdByName === currentUserName;

  // Show fallback UI while party is loading (with timeout to switch to fallback)
  if (!party) {
    // After 2 seconds, show a fallback message instead of just "Loading"
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-lg text-muted-foreground">Setting up party...</div>
        <p className="text-sm text-muted-foreground/70">If this takes too long, refresh the page</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground p-4 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Player and Party Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Party Header with Better Styling */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-hover rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Radio size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold gradient-text">{party.name}</h1>
                    <p className="text-sm text-muted-foreground">Created by {party.createdByName}</p>
                  </div>
                </div>
                {party.description && (
                  <p className="text-muted-foreground mt-3">{party.description}</p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  leaveParty();
                  window.location.href = '/party';
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Party Stats */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Participants</p>
                <p className="text-xl font-bold">{party.participantCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Type</p>
                <Badge variant="outline" className="mt-1">{party.password ? '🔒 Private' : '🌍 Public'}</Badge>
              </div>
            </div>
          </motion.div>

          {/* Music Player */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-hover rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src={currentTrack?.albumArt} />
                <AvatarFallback><Music /></AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{currentTrack?.title}</h2>
                <p className="text-muted-foreground">{currentTrack?.artist}</p>
              </div>
            </div>
            {/* Player Controls */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0:00</span>
                  <span>3:45</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-primary to-accent" />
                </div>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon">
                  <Music className="w-4 h-4" />
                </Button>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 rounded-full w-16 h-16"
                  onClick={() => isPlaying ? pauseTrack() : resumeTrack()}
                >
                  {isPlaying ? "⏸" : "▶"}
                </Button>
                <Button variant="outline" size="icon">
                  <Music className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <span className="text-sm">Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
                  className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer"
                />
                <span className="text-sm w-8">{Math.round(volume * 100)}%</span>
              </div>

              {/* Change Song Button - Only for Party Creator */}
              {isPartyCreator && (
                <Button
                  onClick={() => setShowSongDialog(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Change Song
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Chat and Participants */}
        <div className="space-y-8">
          {/* Participants */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-hover rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center"><Users className="w-5 h-5 mr-2"/> Participants ({party.participants.length})</h3>
            <ScrollArea className="h-48">
              <ul className="space-y-3">
                {party.participants.map((p) => (
                  <li key={p} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${p}`} />
                      <AvatarFallback>{p[0]}</AvatarFallback>
                    </Avatar>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </motion.div>

          {/* Chat */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-hover rounded-3xl p-6 flex flex-col h-[50vh]">
            <h3 className="text-xl font-bold mb-4">Live Chat</h3>
            <ScrollArea className="flex-grow mb-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.userId}`} />
                      <AvatarFallback>{msg.userId[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{msg.userId}</p>
                      <p className="text-sm bg-muted rounded-lg px-3 py-2">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Say something..."
              />
              <Button onClick={handleSendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Song Selector Dialog */}
      <Dialog open={showSongDialog} onOpenChange={setShowSongDialog}>
        <DialogContent className="max-w-2xl max-h-96">
          <DialogHeader>
            <DialogTitle>Select a Song</DialogTitle>
            <DialogDescription>Choose a song to play in the party</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-80">
            <div className="grid gap-2 pr-4">
              {uniqueSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedSong?.id === song.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 ring-2 ring-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={song.image}
                      alt={song.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{song.name}</p>
                      <p className="text-sm text-white/70 truncate">{song.artist}</p>
                      <p className="text-xs text-white/50 mt-1">{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Party;
