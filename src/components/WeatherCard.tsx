import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  temperature?: number;
  condition?: "sunny" | "rainy" | "cloudy" | "snowy" | "windy";
  location?: string;
  className?: string;
}

const weatherIcons = {
  sunny: Sun,
  rainy: CloudRain,
  cloudy: Cloud,
  snowy: CloudSnow,
  windy: Wind,
};

const weatherGradients = {
  sunny: "from-amber-400 via-orange-500 to-pink-500",
  rainy: "from-blue-400 via-cyan-500 to-teal-500",
  cloudy: "from-slate-400 via-gray-500 to-slate-600",
  snowy: "from-blue-200 via-cyan-300 to-teal-200",
  windy: "from-indigo-400 via-purple-500 to-pink-500",
};

export default function WeatherCard({
  temperature = 24,
  condition = "sunny",
  location = "Mumbai",
  className,
}: WeatherCardProps) {
  // Map weather API conditions to our expected format
  const mapWeatherCondition = (condition: string): "sunny" | "rainy" | "cloudy" | "snowy" | "windy" => {
    const conditionMap: { [key: string]: "sunny" | "rainy" | "cloudy" | "snowy" | "windy" } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'rainy',
      'Snow': 'snowy',
      'Mist': 'cloudy',
      'Fog': 'cloudy',
      'Haze': 'cloudy',
      'Wind': 'windy',
      'Tornado': 'windy',
      'Squall': 'windy'
    };
    
    return conditionMap[condition] || 'sunny';
  };

  const mappedCondition = mapWeatherCondition(condition);
  const Icon = weatherIcons[mappedCondition];
  const gradient = weatherGradients[mappedCondition];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-hover rounded-3xl p-8 relative overflow-hidden",
        className
      )}
    >
      {/* Animated Background Gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-20",
        gradient
      )} />
      
      {/* Floating Icon */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10"
      >
        <Icon className="w-24 h-24 text-secondary mb-4" strokeWidth={1.5} />
      </motion.div>

      {/* Weather Info */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold gradient-text mb-2"
        >
          {temperature}°
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground capitalize mb-1"
        >
          {mappedCondition}
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
          {location}
        </motion.p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
    </motion.div>
  );
}
