const SPOTIFY_CLIENT_ID = "76e0fb4c921245ccbd78a0b4e73ae833";
const SPOTIFY_CLIENT_SECRET = "29c573b8b529451b882f33ecb95bf762";
const SPOTIFY_REDIRECT_URI = "http://localhost:5173/callback";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  uri: string;
  duration_ms: number;
  preview_url?: string;
  external_urls?: {
    spotify: string;
  };
}

export interface SpotifySearchResults {
  tracks?: {
    items: SpotifyTrack[];
  };
}

class SpotifyService {
  private accessToken: string | null = null;

  // Get access token using Client Credentials flow
  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        throw new Error("Failed to get Spotify access token");
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      // Token expires in typically 1 hour, refresh before expiry
      setTimeout(() => {
        this.accessToken = null;
      }, (data.expires_in - 300) * 1000);

      return this.accessToken;
    } catch (error) {
      console.error("Error getting Spotify access token:", error);
      throw error;
    }
  }

  // Search for tracks
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search Spotify tracks");
      }

      const data = await response.json();
      const tracks = data.tracks?.items || [];
      
      // Log preview URLs
      console.log('🔍 [SPOTIFY] Search results for:', query);
      tracks.slice(0, 3).forEach((track: SpotifyTrack) => {
        console.log(`  Track: ${track.name}, Preview: ${track.preview_url ? '✅ YES' : '❌ NO'}`);
      });
      
      return tracks;
    } catch (error) {
      console.error("Error searching Spotify tracks:", error);
      return [];
    }
  }

  // Get featured playlists
  async getFeaturedPlaylists(limit: number = 5): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/browse/featured-playlists?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get featured playlists");
      }

      const data = await response.json();
      return data.playlists?.items || [];
    } catch (error) {
      console.error("Error getting featured playlists:", error);
      return [];
    }
  }

  // Get playlist tracks
  async getPlaylistTracks(playlistId: string, limit: number = 50): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get playlist tracks");
      }

      const data = await response.json();
      return data.items?.map((item: any) => item.track) || [];
    } catch (error) {
      console.error("Error getting playlist tracks:", error);
      return [];
    }
  }

  // Get new releases
  async getNewReleases(limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/browse/new-releases?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get new releases");
      }

      const data = await response.json();
      const albums = data.albums?.items || [];
      
      // Get tracks from albums
      const tracks: SpotifyTrack[] = [];
      for (const album of albums) {
        if (album.id) {
          const albumTracks = await this.getAlbumTracks(album.id, 1);
          tracks.push(...albumTracks);
        }
      }
      return tracks;
    } catch (error) {
      console.error("Error getting new releases:", error);
      return [];
    }
  }

  // Get album tracks
  async getAlbumTracks(albumId: string, limit: number = 10): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get album tracks");
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Error getting album tracks:", error);
      return [];
    }
  }

  // Get recommendations
  async getRecommendations(
    seedTracks: string[] = [],
    seedArtists: string[] = [],
    limit: number = 20
  ): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      const seedTrackStr = seedTracks.slice(0, 5).join(",");
      const seedArtistStr = seedArtists.slice(0, 5).join(",");

      let query = "https://api.spotify.com/v1/recommendations?limit=" + limit;
      if (seedTrackStr) query += "&seed_tracks=" + seedTrackStr;
      if (seedArtistStr) query += "&seed_artists=" + seedArtistStr;

      if (!seedTrackStr && !seedArtistStr) {
        // Default seeds if none provided
        query += "&seed_genres=pop,rock,indie";
      }

      const response = await fetch(query, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data = await response.json();
      return data.tracks || [];
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }
}

export const spotifyService = new SpotifyService();

