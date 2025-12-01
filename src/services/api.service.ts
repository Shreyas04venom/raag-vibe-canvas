import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2000, // Very short timeout to fail fast when backend is unavailable
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors (suppress network error logs)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      // Redirect to login or refresh token
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
    // Suppress logging for network errors (ERR_NETWORK, ERR_CONNECTION_REFUSED)
    // These are expected when backend is not running
    if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
      // Only log actual errors, not expected offline scenarios
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string, username: string, displayName?: string) => {
    const response = await api.post('/auth/register', { email, password, username, displayName });
    return response.data;
  },

  login: async (idToken: string) => {
    const response = await api.post('/auth/login', { idToken });
    return response.data;
  },

  googleAuth: async (idToken: string) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  resetPassword: async (email: string) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },

  verifyToken: async (token: string) => {
    const response = await api.post('/auth/verify-token', { token });
    return response.data;
  },
};

// Weather API
export const weatherAPI = {
  getWeatherByLocation: async (location: string) => {
    const response = await api.get('/weather', { params: { location } });
    return response.data;
  },

  getWeatherPreferences: async () => {
    const response = await api.get('/weather/preferences');
    return response.data;
  },

  saveWeatherPreference: async (location: string, isDefault: boolean = false) => {
    const response = await api.post('/weather/preferences', { location, isDefault });
    return response.data;
  },

  deleteWeatherPreference: async (id: string) => {
    const response = await api.delete(`/weather/preferences/${id}`);
    return response.data;
  },
};

// Music API (Spotify)
export const musicAPI = {
  // Spotify Auth
  getSpotifyAuthUrl: async () => {
    const response = await api.get('/music/auth/spotify');
    return response.data;
  },

  handleSpotifyCallback: async (code: string, state: string) => {
    const response = await api.get('/music/auth/spotify/callback', { params: { code, state } });
    return response.data;
  },

  // Search
  search: async (query: string, type: string = 'track', limit: number = 20) => {
    const response = await api.get('/music/search', { params: { q: query, type, limit } });
    return response.data;
  },

  getTrack: async (trackId: string) => {
    const response = await api.get(`/music/tracks/${trackId}`);
    return response.data;
  },

  getAlbumDetails: async (albumId: string) => {
    const response = await api.get(`/music/albums/${albumId}`);
    return response.data;
  },

  getArtist: async (artistId: string) => {
    const response = await api.get(`/music/artists/${artistId}`);
    return response.data;
  },

  getLyrics: async (trackId: string) => {
    const response = await api.get(`/music/tracks/${trackId}/lyrics`);
    return response.data;
  },

  // Playback
  getPlaybackState: async () => {
    const response = await api.get('/music/playback');
    return response.data;
  },

  controlPlayback: async (action: string, deviceId?: string, contextUri?: string, uris?: string[], positionMs?: number) => {
    const response = await api.post('/music/playback', { action, deviceId, contextUri, uris, positionMs });
    return response.data;
  },

  playTrack: async (trackUri: string, deviceId?: string) => {
    const response = await api.post('/music/playback/track', { trackUri, deviceId });
    return response.data;
  },

  // Favorites
  getFavorites: async (limit: number = 20, offset: number = 0) => {
    const response = await api.get('/music/favorites', { params: { limit, offset } });
    return response.data;
  },

  addToFavorites: async (trackIds: string[]) => {
    const response = await api.post('/music/favorites', { trackIds });
    return response.data;
  },

  removeFromFavorites: async (trackIds: string[]) => {
    const response = await api.delete('/music/favorites', { data: { trackIds } });
    return response.data;
  },

  // History
  getHistory: async (limit: number = 20) => {
    const response = await api.get('/music/history', { params: { limit } });
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { displayName?: string; bio?: string; avatarUrl?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  getReferralCode: async () => {
    const response = await api.get('/users/referral');
    return response.data;
  },

  redeemReferral: async (code: string) => {
    const response = await api.post('/users/referral/redeem', { code });
    return response.data;
  },
};

// Playlist API
export const playlistAPI = {
  getPlaylists: async () => {
    const response = await api.get('/playlists');
    return response.data;
  },

  getPlaylist: async (id: string) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  createPlaylist: async (name: string, description?: string, isPublic: boolean = true) => {
    const response = await api.post('/playlists', { name, description, isPublic });
    return response.data;
  },

  updatePlaylist: async (id: string, data: { name?: string; description?: string; isPublic?: boolean }) => {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data;
  },

  deletePlaylist: async (id: string) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string, position?: number) => {
    const response = await api.post(`/playlists/${playlistId}/tracks`, { trackId, position });
    return response.data;
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    const response = await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
    return response.data;
  },
};

// Party API (Listening Parties)
export const partyAPI = {
  createParty: async (name: string) => {
    const response = await api.post('/parties', { name });
    return response.data;
  },

  getParty: async (id: string) => {
    const response = await api.get(`/parties/${id}`);
    return response.data;
  },

  joinParty: async (inviteCode: string) => {
    const response = await api.post('/parties/join', { inviteCode });
    return response.data;
  },

  leaveParty: async (id: string) => {
    const response = await api.delete(`/parties/${id}/leave`);
    return response.data;
  },

  updatePartyState: async (id: string, data: { currentTrackId?: string; currentPosition?: number; isPlaying?: boolean }) => {
    const response = await api.put(`/parties/${id}/state`, data);
    return response.data;
  },

  sendPartyMessage: async (id: string, content: string) => {
    const response = await api.post(`/parties/${id}/messages`, { content });
    return response.data;
  },

  addPartyReaction: async (id: string, reaction: string) => {
    const response = await api.post(`/parties/${id}/reactions`, { reaction });
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  createSubscription: async (plan: string, priceId: string) => {
    const response = await api.post('/payments/subscription', { plan, priceId });
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.delete('/payments/subscription');
    return response.data;
  },

  getSubscriptionStatus: async () => {
    const response = await api.get('/payments/subscription');
    return response.data;
  },

  processUPIPayment: async (amount: number, upiId: string) => {
    const response = await api.post('/payments/upi', { amount, upiId });
    return response.data;
  },

  createStripeCheckout: async (priceId: string) => {
    const response = await api.post('/payments/stripe/checkout', { priceId });
    return response.data;
  },
};

// Search API
export const searchAPI = {
  globalSearch: async (query: string, types: string[] = ['tracks', 'artists', 'albums', 'playlists']) => {
    const response = await api.get('/search', { params: { q: query, types } });
    return response.data;
  },

  getTrending: async (type: string = 'tracks') => {
    const response = await api.get('/search/trending', { params: { type } });
    return response.data;
  },

  getRecommendations: async (seedTracks?: string[], seedArtists?: string[], seedGenres?: string[]) => {
    const response = await api.get('/search/recommendations', { 
      params: { seedTracks, seedArtists, seedGenres } 
    });
    return response.data;
  },
};

export default api;