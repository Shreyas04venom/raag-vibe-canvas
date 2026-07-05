export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  previewUrl: string;
  duration: number;
  source: string; // 'youtube' | 'itunes'
  videoId?: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  tracks?: Track[];
}

export interface WeatherData {
  city: string;
  country?: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  condition: string;
  description: string;
  icon: string;
  sunrise?: number;
  sunset?: number;
  mood: string;
  musicQuery: string;
  emoji: string;
}
