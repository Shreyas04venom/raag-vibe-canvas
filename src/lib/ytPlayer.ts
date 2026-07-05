// Thin wrapper around the YouTube IFrame Player API.
// A single hidden player instance drives full-song playback.

let ytReady: Promise<void> | null = null;

function loadYT(): Promise<void> {
  if (ytReady) return ytReady;
  ytReady = new Promise<void>((resolve) => {
    const w = window as any;
    if (w.YT?.Player) return resolve();
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve();
    };
    if (!document.querySelector('script[data-yt-iframe]')) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      s.dataset.ytIframe = '1';
      document.head.appendChild(s);
    }
  });
  return ytReady;
}

export type YTState = 'playing' | 'paused' | 'ended' | 'buffering' | 'ready';

export interface YTController {
  load(videoId: string, autoplay: boolean): void;
  play(): void;
  pause(): void;
  seek(sec: number): void;
  setVolume(v: number): void; // 0..1
  mute(m: boolean): void;
  getTime(): number;
  getDuration(): number;
  onState(cb: (s: YTState) => void): void;
  destroy(): void;
}

export async function createYTController(elementId: string): Promise<YTController> {
  await loadYT();
  const YT = (window as any).YT;
  let stateCb: ((s: YTState) => void) | null = null;

  const player: any = await new Promise((resolve) => {
    const p = new YT.Player(elementId, {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        fs: 0,
      },
      events: {
        onReady: () => resolve(p),
        onStateChange: (e: any) => {
          if (!stateCb) return;
          const s = e.data;
          if (s === YT.PlayerState.PLAYING) stateCb('playing');
          else if (s === YT.PlayerState.PAUSED) stateCb('paused');
          else if (s === YT.PlayerState.ENDED) stateCb('ended');
          else if (s === YT.PlayerState.BUFFERING) stateCb('buffering');
        },
      },
    });
  });

  return {
    load(videoId, autoplay) {
      if (autoplay) player.loadVideoById(videoId);
      else player.cueVideoById(videoId);
    },
    play: () => player.playVideo(),
    pause: () => player.pauseVideo(),
    seek: (s) => player.seekTo(s, true),
    setVolume: (v) => player.setVolume(Math.round(Math.max(0, Math.min(1, v)) * 100)),
    mute: (m) => (m ? player.mute() : player.unMute()),
    getTime: () => {
      try { return player.getCurrentTime() || 0; } catch { return 0; }
    },
    getDuration: () => {
      try { return player.getDuration() || 0; } catch { return 0; }
    },
    onState: (cb) => (stateCb = cb),
    destroy: () => player.destroy(),
  };
}
