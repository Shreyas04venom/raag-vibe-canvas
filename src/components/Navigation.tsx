import { motion } from "framer-motion";
import { Home, Search, Library, User, Radio } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/raagweather-logo.png";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Radio, label: "Party", path: "/party" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 glass-hover flex-col p-6 z-40"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8">
          <img src={logo} alt="RaagWeather" className="w-12 h-12" />
          <span className="text-2xl font-bold gradient-text">RaagWeather</span>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "hover:bg-card/80"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-20 left-0 right-0 z-40 px-4"
      >
        <div className="glass-hover rounded-3xl p-2 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all",
                    isActive && "bg-gradient-to-br from-primary/20 to-accent/20"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
