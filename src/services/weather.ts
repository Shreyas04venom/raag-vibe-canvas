const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  timestamp: number;
}

export interface WeatherRecommendation {
  mood: string;
  genres: string[];
  energy: number; // 0-1 scale
  valence: number; // 0-1 scale (happiness)
}

class WeatherService {
  private currentWeather: WeatherData | null = null;

  async getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      
      const weatherData: WeatherData = {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        feelsLike: Math.round(data.main.feels_like),
        timestamp: Date.now()
      };

      this.currentWeather = weatherData;
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      
      const weatherData: WeatherData = {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        feelsLike: Math.round(data.main.feels_like),
        timestamp: Date.now()
      };

      this.currentWeather = weatherData;
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  getWeatherRecommendation(weatherData: WeatherData): WeatherRecommendation {
    const { condition, temperature } = weatherData;
    
    // Weather-based music recommendations
    const recommendations = {
      Clear: {
        mood: 'Happy & Uplifting',
        genres: ['pop', 'dance', 'electronic', 'bollywood'],
        energy: 0.8,
        valence: 0.9
      },
      Clouds: {
        mood: 'Chill & Relaxed',
        genres: ['indie', 'ambient', 'jazz', 'acoustic'],
        energy: 0.4,
        valence: 0.6
      },
      Rain: {
        mood: 'Melancholic & Deep',
        genres: ['indie', 'alternative', 'classical', 'ghazal'],
        energy: 0.3,
        valence: 0.3
      },
      Drizzle: {
        mood: 'Contemplative & Soft',
        genres: ['indie', 'folk', 'soft-rock', 'sufi'],
        energy: 0.4,
        valence: 0.5
      },
      Thunderstorm: {
        mood: 'Intense & Powerful',
        genres: ['rock', 'metal', 'electronic', 'heavy-bollywood'],
        energy: 0.9,
        valence: 0.4
      },
      Snow: {
        mood: 'Peaceful & Serene',
        genres: ['classical', 'ambient', 'instrumental', 'meditation'],
        energy: 0.2,
        valence: 0.7
      },
      Mist: {
        mood: 'Mysterious & Atmospheric',
        genres: ['ambient', 'experimental', 'post-rock', 'sufi'],
        energy: 0.3,
        valence: 0.4
      }
    };

    let baseRecommendation = recommendations[condition as keyof typeof recommendations] || 
                            recommendations.Clear;

    // Adjust based on temperature
    if (temperature < 10) {
      baseRecommendation = {
        ...baseRecommendation,
        mood: 'Cozy & Warm',
        genres: [...baseRecommendation.genres, 'jazz', 'soul', 'blues']
      };
    } else if (temperature > 30) {
      baseRecommendation = {
        ...baseRecommendation,
        mood: 'Energetic & Hot',
        genres: [...baseRecommendation.genres, 'summer', 'tropical', 'party']
      };
    }

    return baseRecommendation;
  }

  getCurrentWeather(): WeatherData | null {
    return this.currentWeather;
  }

  // Get weather-based search parameters for Spotify
  getSpotifySearchParams(weatherData: WeatherData): { q: string; type: string } {
    const recommendation = this.getWeatherRecommendation(weatherData);
    
    // Create search query based on weather mood and genres
    const moodQueries = {
      'Happy & Uplifting': 'happy upbeat energetic',
      'Chill & Relaxed': 'chill relaxed mellow',
      'Melancholic & Deep': 'melancholic sad emotional',
      'Contemplative & Soft': 'soft contemplative gentle',
      'Intense & Powerful': 'intense powerful energetic',
      'Peaceful & Serene': 'peaceful calm serene',
      'Mysterious & Atmospheric': 'atmospheric mysterious ambient'
    };

    const moodQuery = moodQueries[recommendation.mood as keyof typeof moodQueries] || 'music';
    const genreQuery = recommendation.genres.slice(0, 2).join(' ');
    
    return {
      q: `${moodQuery} ${genreQuery}`,
      type: 'track,playlist'
    };
  }
}

export const weatherService = new WeatherService();