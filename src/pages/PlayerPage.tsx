// Redirect to full-screen player: expand via GlobalPlayer state
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
export default function PlayerPage() {
  const { current } = usePlayer();
  const nav = useNavigate();
  useEffect(() => { nav(current ? '/queue' : '/home', { replace: true }); }, [current, nav]);
  return null;
}
