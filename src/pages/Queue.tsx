import Navigation from '@/components/Navigation';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Play, X, GripVertical, Trash2 } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

export default function Queue() {
  const { queue, current, index, play, removeFromQueue, clearQueue, reorderQueue } = usePlayer();

  return (
    <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
      <Navigation />
      <main className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-text">Queue</h1>
          {queue.length > 1 && <Button variant="outline" size="sm" onClick={clearQueue} className="gap-2"><Trash2 className="w-4 h-4" />Clear</Button>}
        </div>

        {current && (
          <div className="glass rounded-2xl p-4 mb-6 border border-primary/30">
            <p className="text-xs uppercase tracking-wider text-primary mb-2">Now playing</p>
            <div className="flex items-center gap-3">
              <img src={current.image} alt="" className="w-14 h-14 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{current.name}</p>
                <p className="text-sm text-muted-foreground truncate">{current.artist}</p>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Up next ({Math.max(0, queue.length - index - 1)})</h2>
        {queue.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Queue is empty.</p>
        ) : (
          <Reorder.Group axis="y" values={queue} onReorder={(newList) => {
            // Basic reorder: find first mismatch and move
            for (let i = 0; i < newList.length; i++) {
              if (newList[i].id !== queue[i]?.id) {
                const from = queue.findIndex((t) => t.id === newList[i].id);
                if (from >= 0 && from !== i) reorderQueue(from, i);
                break;
              }
            }
          }} className="space-y-1">
            {queue.map((t, i) => (
              <Reorder.Item key={t.id + i} value={t} className="flex items-center gap-2 glass rounded-xl p-2 cursor-grab">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <img src={t.image} alt="" className="w-10 h-10 rounded" />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${i === index ? 'text-primary font-medium' : ''}`}>{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.artist}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => play(t, queue)}><Play className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => removeFromQueue(i)}><X className="w-4 h-4" /></Button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </main>
    </div>
  );
}
