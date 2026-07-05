import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { LibraryProvider } from "./contexts/LibraryContext";
import { WeatherProvider } from "./contexts/WeatherContext";
import GlobalPlayer from "./components/GlobalPlayer";
import CommandPalette from "./components/CommandPalette";
import Splash from "./pages/Splash";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Search from "./pages/Search";
import PlayerPage from "./pages/PlayerPage";
import Party from "./pages/Party";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import PlaylistDetail from "./pages/PlaylistDetail";
import Settings from "./pages/Settings";
import Queue from "./pages/Queue";
import NotFound from "./pages/NotFound";
import { ReactNode } from "react";

const queryClient = new QueryClient();

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <AuthProvider>
          <PlayerProvider>
            <LibraryProvider>
              <WeatherProvider>
                <Routes>
                  <Route path="/" element={<Splash />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/home" element={<Protected><Home /></Protected>} />
                  <Route path="/search" element={<Protected><Search /></Protected>} />
                  <Route path="/player" element={<Protected><PlayerPage /></Protected>} />
                  <Route path="/party" element={<Protected><Party /></Protected>} />
                  <Route path="/party/:id" element={<Protected><Party /></Protected>} />
                  <Route path="/profile" element={<Protected><Profile /></Protected>} />
                  <Route path="/library" element={<Protected><Library /></Protected>} />
                  <Route path="/playlist/:id" element={<Protected><PlaylistDetail /></Protected>} />
                  <Route path="/settings" element={<Protected><Settings /></Protected>} />
                  <Route path="/queue" element={<Protected><Queue /></Protected>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <GlobalPlayer />
                <CommandPalette />
              </WeatherProvider>
            </LibraryProvider>
          </PlayerProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
