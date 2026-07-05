import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.h1 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl font-bold gradient-text mb-4">404</motion.h1>
      <p className="text-muted-foreground mb-6">That page went off-key.</p>
      <Link to="/home"><Button className="gap-2"><Home className="w-4 h-4" />Home</Button></Link>
    </div>
  );
}
