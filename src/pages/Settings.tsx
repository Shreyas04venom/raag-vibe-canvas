import { motion } from "framer-motion";
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Volume2,
  Globe,
  Bell,
  Moon,
  Sun,
  Smartphone,
  Shield,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import MiniPlayer from "@/components/MiniPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const { volume, setVolume } = usePlayer();
  const { toast } = useToast();
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [audioQuality, setAudioQuality] = useState("high");
  const [language, setLanguage] = useState(user?.language || "en");
  const [autoplay, setAutoplay] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState("high");

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    toast({
      title: darkMode ? 'Light Mode' : 'Dark Mode',
      description: `Switched to ${darkMode ? 'light' : 'dark'} theme`,
    });
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    updateProfile({ language: newLang });
  };

  const handleAudioQualityChange = (quality: string) => {
    setAudioQuality(quality);
    toast({
      title: 'Audio Quality Updated',
      description: `Streaming quality set to ${quality}`,
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen pb-32 lg:pb-24">
      <Navigation />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold gradient-text">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Customize your RaagWeather experience
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6 max-w-3xl">
          {/* Audio Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Audio</h2>
            </div>

            <div className="space-y-6">
              {/* Volume */}
              <div>
                <Label className="mb-3 block">Volume</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">
                    {volume}%
                  </span>
                </div>
              </div>

              {/* Audio Quality */}
              <div>
                <Label className="mb-3 block">Streaming Quality</Label>
                <Select value={audioQuality} onValueChange={handleAudioQualityChange}>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (96 kbps)</SelectItem>
                    <SelectItem value="medium">Medium (160 kbps)</SelectItem>
                    <SelectItem value="high">High (320 kbps)</SelectItem>
                    <SelectItem value="lossless">Lossless (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Download Quality */}
              <div>
                <Label className="mb-3 block">Download Quality</Label>
                <Select value={downloadQuality} onValueChange={setDownloadQuality}>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Autoplay */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autoplay</Label>
                  <p className="text-sm text-muted-foreground">
                    Continue playing similar songs
                  </p>
                </div>
                <Switch checked={autoplay} onCheckedChange={setAutoplay} />
              </div>
            </div>
          </motion.section>

          {/* Appearance */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              {darkMode ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <h2 className="text-xl font-bold">Appearance</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
              </div>
            </div>
          </motion.section>

          {/* Language & Region */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Language & Region</h2>
            </div>

            <div>
              <Label className="mb-3 block">App Language</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                  <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.section>

          {/* Notifications */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and recommendations
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </motion.section>

          {/* Privacy & Security */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Privacy & Security</h2>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start glass">
                <Smartphone className="w-4 h-4 mr-3" />
                Manage Connected Devices
              </Button>
              <Button variant="outline" className="w-full justify-start glass">
                <Shield className="w-4 h-4 mr-3" />
                Privacy Settings
              </Button>
            </div>
          </motion.section>

          {/* Help & Support */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Help & Support</h2>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start glass">
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start glass">
                Report a Problem
              </Button>
              <Button variant="outline" className="w-full justify-start glass">
                Terms of Service
              </Button>
            </div>
          </motion.section>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              variant="destructive"
              className="w-full"
              size="lg"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Log Out
            </Button>
          </motion.div>
        </div>
      </main>

      <MiniPlayer />
    </div>
  );
}
