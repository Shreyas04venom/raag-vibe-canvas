import { motion } from "framer-motion";
import { Settings, Share2, Trophy, Music, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import MiniPlayer from "@/components/MiniPlayer";

const stats = [
  { icon: Music, label: "Songs Played", value: "1,234", color: "from-primary to-purple-600" },
  { icon: Clock, label: "Hours Listened", value: "156", color: "from-secondary to-cyan-600" },
  { icon: Heart, label: "Favorites", value: "89", color: "from-accent to-pink-600" },
  { icon: Trophy, label: "Day Streak", value: "12", color: "from-amber-500 to-orange-600" },
];

export default function Profile() {
  return (
    <div className="min-h-screen pb-32 lg:pb-24">
      <Navigation />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-hover rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Avatar className="w-32 h-32 border-4 border-primary/50">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-4xl">SK</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center border-4 border-background">
                <Trophy className="w-5 h-5" />
              </div>
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">Shreyas Kumar</h1>
              <p className="text-muted-foreground text-lg mb-4">
                @shreyas_music • Premium Member
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge className="bg-gradient-to-r from-primary to-purple-600">
                  Music Lover
                </Badge>
                <Badge className="bg-gradient-to-r from-accent to-pink-600">
                  12 Day Streak 🔥
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="glass-hover">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="glass-hover">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -4 }}
                className="glass-hover rounded-2xl p-6"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Achievements</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "First Song", desc: "Played your first song", unlocked: true },
              { title: "Week Warrior", desc: "7 day listening streak", unlocked: true },
              { title: "Party Host", desc: "Host your first party", unlocked: false },
            ].map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`glass-hover rounded-2xl p-6 ${
                  !achievement.unlocked && "opacity-50"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-primary to-accent"
                      : "bg-muted"
                  } flex items-center justify-center mb-4`}
                >
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-1">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">{achievement.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Premium Upsell */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-hover rounded-3xl p-8 bg-gradient-to-br from-primary/20 to-accent/20"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-600">
                Premium
              </Badge>
              <h2 className="text-3xl font-bold mb-2">
                Upgrade to Premium
              </h2>
              <p className="text-muted-foreground mb-6">
                Unlock unlimited skips, ad-free listening, and exclusive features
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
              >
                Get Premium
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-4">
                <p className="text-2xl font-bold mb-1">∞</p>
                <p className="text-sm text-muted-foreground">Unlimited Skips</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-2xl font-bold mb-1">0</p>
                <p className="text-sm text-muted-foreground">Ads</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <MiniPlayer />
    </div>
  );
}
