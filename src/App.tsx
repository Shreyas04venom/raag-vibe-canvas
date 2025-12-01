import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import { MusicProvider } from "./contexts/MusicContext";
import { PartyProvider } from "./contexts/PartyContext";
import Splash from "./pages/Splash";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Player from "./pages/Player";
import Party from "./pages/Party";
import PartyLobby from "./pages/PartyLobby";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import TrendingAll from "./pages/TrendingAll";
import Settings from "./pages/Settings";
import Queue from "./pages/Queue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MusicProvider>
            <PlayerProvider>
              <PlaylistProvider>
                <PartyProvider>
                  <Routes>
                    <Route path="/" element={<Splash />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/player" element={<Player />} />
                    <Route path="/party" element={<PartyLobby />} />
                    <Route path="/party/:partyId" element={<Party />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/trending-all" element={<TrendingAll />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/queue" element={<Queue />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PartyProvider>
              </PlaylistProvider>
            </PlayerProvider>
          </MusicProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
