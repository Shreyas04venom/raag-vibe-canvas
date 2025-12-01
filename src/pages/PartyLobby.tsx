import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Radio, Plus, Share2, Lock, Globe, Copy, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import MiniPlayer from "@/components/MiniPlayer";
import { useParty } from "@/contexts/PartyContext";

const liveParties = [
  {
    id: 1,
    name: "Monsoon Vibes 🌧️",
    host: "Priya",
    listeners: 42,
    currentSong: "Tum Hi Ho",
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Late Night Chill",
    host: "Rahul",
    listeners: 28,
    currentSong: "Kesariya",
    avatar: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Bollywood Party 🎉",
    host: "Ananya",
    listeners: 65,
    currentSong: "Apna Bana Le",
    avatar: "/placeholder.svg",
  },
];

export default function PartyLobby() {
  const navigate = useNavigate();
  const { createParty, joinParty, allParties, currentUserName, setCurrentUserName, getAllParties } = useParty();
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showUserNameDialog, setShowUserNameDialog] = useState(!currentUserName || currentUserName === 'Guest');
  
  // Form states
  const [tempUserName, setTempUserName] = useState(currentUserName);
  const [partyName, setPartyName] = useState("");
  const [partyDesc, setPartyDesc] = useState("");
  const [partyPassword, setPartyPassword] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [selectedPartyToJoin, setSelectedPartyToJoin] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSetUserName = () => {
    if (tempUserName.trim()) {
      setCurrentUserName(tempUserName.trim());
      setShowUserNameDialog(false);
    }
  };

  const handleCreateParty = async () => {
    if (!partyName.trim()) return;
    
    setIsCreating(true);
    try {
      await createParty(
        partyName,
        partyDesc || undefined,
        isPublic,
        partyPassword || undefined
      );
      
      setPartyName("");
      setPartyDesc("");
      setPartyPassword("");
      setShowCreateDialog(false);
      
      // Navigate to the new party after brief delay
      setTimeout(() => {
        const parties = getAllParties();
        const newParty = parties[parties.length - 1];
        if (newParty) {
          navigate(`/party/${newParty.id}`);
        }
      }, 300);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinParty = async (partyId: string) => {
    setJoinError("");
    const success = await joinParty(partyId, joinPassword || undefined);
    
    if (success) {
      setJoinPassword("");
      setShowJoinDialog(false);
      setSelectedPartyToJoin(null);
      navigate(`/party/${partyId}`);
    } else {
      setJoinError("Incorrect password or party not found");
    }
  };

  const copyShareLink = (partyId: string, partyName: string) => {
    const link = `${window.location.origin}/party/${partyId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(partyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parties = getAllParties();

  return (
    <div className="min-h-screen pb-32 lg:pb-24 bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* User Name Setup Dialog */}
        <Dialog open={showUserNameDialog} onOpenChange={setShowUserNameDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="gradient-text">Welcome to RaagWeather!</DialogTitle>
              <DialogDescription>Enter your name to get started</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSetUserName()}
                className="bg-white/10 border-white/20"
              />
              <Button 
                onClick={handleSetUserName}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Party Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="gradient-text">Create New Party</DialogTitle>
              <DialogDescription>Start a listening party with your friends</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Party Name *</label>
                <Input
                  placeholder="e.g., Monsoon Vibes"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="bg-white/10 border-white/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  placeholder="e.g., Chill vibes for rainy days"
                  value={partyDesc}
                  onChange={(e) => setPartyDesc(e.target.value)}
                  className="bg-white/10 border-white/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Password (Optional)</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave empty for no password"
                    value={partyPassword}
                    onChange={(e) => setPartyPassword(e.target.value)}
                    className="bg-white/10 border-white/20 pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block">Privacy</label>
                <div className="flex gap-3">
                  <Button
                    variant={isPublic ? "default" : "outline"}
                    className={`flex-1 ${isPublic ? "bg-primary" : ""}`}
                    onClick={() => setIsPublic(true)}
                  >
                    <Globe size={18} className="mr-2" />
                    Public
                  </Button>
                  <Button
                    variant={!isPublic ? "default" : "outline"}
                    className={`flex-1 ${!isPublic ? "bg-primary" : ""}`}
                    onClick={() => setIsPublic(false)}
                  >
                    <Lock size={18} className="mr-2" />
                    Private
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCreateParty}
                disabled={!partyName.trim() || isCreating}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isCreating ? "Creating..." : "Create Party"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Party Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="gradient-text">Join Party</DialogTitle>
              <DialogDescription>
                {selectedPartyToJoin && parties.find(p => p.id === selectedPartyToJoin)?.password
                  ? "This party requires a password"
                  : "Enter the password if required"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedPartyToJoin && parties.find(p => p.id === selectedPartyToJoin) && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Joining</p>
                  <p className="text-lg font-semibold">{parties.find(p => p.id === selectedPartyToJoin)?.name}</p>
                </div>
              )}

              {selectedPartyToJoin && parties.find(p => p.id === selectedPartyToJoin)?.password && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showJoinPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={joinPassword}
                      onChange={(e) => {
                        setJoinPassword(e.target.value);
                        setJoinError("");
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinParty(selectedPartyToJoin)}
                      className="bg-white/10 border-white/20 pr-10"
                    />
                    <button
                      onClick={() => setShowJoinPassword(!showJoinPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showJoinPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {joinError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
                  {joinError}
                </div>
              )}

              <Button
                onClick={() => selectedPartyToJoin && handleJoinParty(selectedPartyToJoin)}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Join Party
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-2">Listening Parties</h1>
              <p className="text-muted-foreground">
                Host or join a party • Create vibes with friends • Current user: <span className="text-primary font-semibold">{currentUserName}</span>
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Create Party
            </Button>
          </div>
        </motion.div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <Radio className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground mb-4">No parties yet</p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Plus size={18} />
                Create the first party
              </Button>
            </motion.div>
          ) : (
            parties.map((party, idx) => (
              <motion.div
                key={party.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group glass-hover rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all"
              >
                {/* Party Header */}
                <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Radio size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{party.name}</h3>
                        <p className="text-sm text-muted-foreground">by {party.createdByName}</p>
                      </div>
                    </div>
                    {party.password && (
                      <Badge variant="secondary" className="gap-1">
                        <Lock size={12} />
                        Private
                      </Badge>
                    )}
                  </div>

                  {party.description && (
                    <p className="text-sm text-muted-foreground mb-3">{party.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={16} />
                      {party.participantCount} listener{party.participantCount !== 1 ? 's' : ''}
                    </div>
                    <Badge variant="outline">{party.isPublic ? 'Public' : 'Private'}</Badge>
                  </div>
                </div>

                {/* Participants */}
                <div className="p-6 border-b border-white/10">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Participants</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {party.participants.slice(0, 4).map((participant, i) => (
                      <Avatar key={i} className="w-8 h-8 border border-primary/50">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${participant}`} />
                        <AvatarFallback>{participant.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))}
                    {party.participants.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-xs font-medium">
                        +{party.participants.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 space-y-3">
                  <Button
                    onClick={() => {
                      setSelectedPartyToJoin(party.id);
                      setJoinPassword("");
                      setJoinError("");
                      setShowJoinDialog(true);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
                  >
                    <Radio size={18} />
                    Join Party
                  </Button>

                  <Button
                    onClick={() => copyShareLink(party.id, party.name)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {copiedId === party.id ? (
                      <>
                        <Check size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 size={18} />
                        Share Link
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <MiniPlayer />
    </div>
  );
}
