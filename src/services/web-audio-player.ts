// Web Audio Player Service
let audioElement: HTMLAudioElement | null = null;

export interface AudioPlayerConfig {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
}

// Generate a simple audio blob that works without CORS
function generateTestAudio(): string {
  try {
    // Create a simple 30-second tone using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 30; // 30 seconds
    const sampleRate = audioContext.sampleRate;
    const channels = 1;
    const frameCount = sampleRate * duration;
    
    const audioBuffer = audioContext.createBuffer(channels, frameCount, sampleRate);
    const data = audioBuffer.getChannelData(0);
    
    // Generate a simple sine wave (440 Hz - A note)
    const frequency = 440;
    const angle = (frequency * 2 * Math.PI) / sampleRate;
    
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.sin(angle * i) * 0.3; // Volume at 0.3 to avoid distortion
    }
    
    // Convert AudioBuffer to WAV blob
    const wavBlob = audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    console.log('✅ Generated local test audio:', url);
    return url;
  } catch (error) {
    console.error('❌ Error generating audio:', error);
    throw error;
  }
}

// Convert AudioBuffer to WAV format
function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const length = audioBuffer.length * audioBuffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " subchunk
  setUint32(16); // subchunk1 size
  setUint16(1); // PCM
  setUint16(audioBuffer.numberOfChannels);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * audioBuffer.numberOfChannels); // avg. byte rate
  setUint16(audioBuffer.numberOfChannels * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" subchunk
  setUint32(length - pos - 4); // chunk length

  const volume = 0.8;
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

class WebAudioPlayer {
  private audio: HTMLAudioElement;
  private currentUrl: string | null = null;
  private config: AudioPlayerConfig = {};
  private loadStarted = false;
  private generatedAudioUrl: string | null = null;

  constructor() {
    if (!audioElement) {
      audioElement = new Audio();
      audioElement.crossOrigin = "anonymous";
      // Append to body to ensure it's properly initialized
      if (document && document.body) {
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
      }
    }
    this.audio = audioElement;
    
    // Pre-generate the test audio
    try {
      this.generatedAudioUrl = generateTestAudio();
    } catch (error) {
      console.error('Failed to generate test audio:', error);
    }
    
    this.setupListeners();
  }

  private setupListeners() {
    this.audio.addEventListener('play', () => {
      console.log('🎵 Audio playing:', this.audio.src);
      this.config.onPlay?.();
    });

    this.audio.addEventListener('pause', () => {
      console.log('⏸️ Audio paused');
      this.config.onPause?.();
    });

    this.audio.addEventListener('ended', () => {
      console.log('⏹️ Audio ended');
      this.config.onEnded?.();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.config.onTimeUpdate?.(this.audio.currentTime, this.audio.duration);
    });

    this.audio.addEventListener('error', () => {
      const error = this.getErrorMessage(this.audio.error?.code);
      console.error('❌ Audio error:', error, 'Code:', this.audio.error?.code);
      this.config.onError?.(error);
    });

    this.audio.addEventListener('loadstart', () => {
      console.log('📥 Loading audio from:', this.audio.src);
      this.loadStarted = true;
    });

    this.audio.addEventListener('canplay', () => {
      console.log('▶️ Audio can play, duration:', this.audio.duration);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      console.log('📊 Metadata loaded, duration:', this.audio.duration);
    });
  }

  setConfig(config: AudioPlayerConfig) {
    this.config = { ...this.config, ...config };
  }

  async play(url: string, startTime: number = 0): Promise<void> {
    try {
      console.log('▶️ [PLAYER] Playing:', url.substring(0, 80));
      
      if (!url) {
        throw new Error('No URL provided for playback');
      }

      // Always set new source to ensure fresh load
      this.audio.src = url;
      this.currentUrl = url;
      
      // For Spotify URLs, remove crossOrigin (they handle it differently)
      // For generated blob URLs, crossOrigin is not needed
      if (url.includes('blob:')) {
        this.audio.crossOrigin = '';
      } else if (url.includes('spotify')) {
        // Spotify preview URLs don't need crossOrigin
        this.audio.crossOrigin = '';
      }
      
      console.log('🔄 [PLAYER] Audio src set');

      this.audio.currentTime = startTime;
      
      console.log('📥 [PLAYER] Calling play()...');
      const playPromise = this.audio.play();

      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ [PLAYER] Play promise resolved, duration:', this.audio.duration, 'current time:', this.audio.currentTime);
      }
    } catch (error) {
      console.error('❌ [PLAYER] Play error:', error);
      this.config.onError?.(`Failed to play audio: ${error}`);
      throw error;
    }
  }

  getGeneratedAudioUrl(): string | null {
    return this.generatedAudioUrl;
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(volume: number): void {
    // Ensure volume is between 0 and 1
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  setCurrentTime(time: number): void {
    this.audio.currentTime = time;
  }

  seek(time: number): void {
    this.audio.currentTime = time;
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }

  private getErrorMessage(code?: number): string {
    const errorMessages: { [key: number]: string } = {
      1: 'Audio loading aborted',
      2: 'Network error',
      3: 'Audio decoding failed',
      4: 'Audio format not supported',
    };
    return errorMessages[code || 0] || 'Unknown error';
  }
}

export const webAudioPlayer = new WebAudioPlayer();
