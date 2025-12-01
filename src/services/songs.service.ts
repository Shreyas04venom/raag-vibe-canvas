import { spotifyService, SpotifyTrack } from "./spotify";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number; // in seconds
  preview_url?: string;
  spotify_url: string;
  uri: string;
}

class SongsService {
  // Convert Spotify track to our Song format
  private convertSpotifyTrack(track: SpotifyTrack): Song | null {
    try {
      // Handle missing artists
      const artists = track.artists || [];
      const artistName = artists.length > 0 
        ? artists.map((a) => a.name).join(", ")
        : "Unknown Artist";
      
      // Handle missing album info
      const albumName = track.album?.name || "Unknown Album";
      const albumImage = track.album?.images?.[0]?.url || "https://via.placeholder.com/300x300?text=No+Image";
      
      return {
        id: track.id,
        title: track.name || "Unknown Track",
        artist: artistName,
        album: albumName,
        albumArt: albumImage,
        duration: Math.floor((track.duration_ms || 0) / 1000),
        preview_url: track.preview_url,
        spotify_url: track.external_urls?.spotify || "",
        uri: track.uri,
      };
    } catch (error) {
      console.warn("Error converting track:", track, error);
      return null;
    }
  }

  // Get trending songs
  async getTrendingSongs(): Promise<Song[]> {
    try {
      // Search for popular tracks
      const tracks = await spotifyService.searchTracks("top hits", 15);
      console.log('📊 Raw Spotify tracks:', tracks.slice(0, 3).map(t => ({
        name: t.name,
        preview_url: t.preview_url,
        artist: t.artists?.[0]?.name
      })));
      
      const songs = tracks
        .map((track) => this.convertSpotifyTrack(track))
        .filter((song): song is Song => song !== null);
      
      console.log('🎵 Converted songs:', songs.length, 'with preview URLs:', songs.filter(s => s.preview_url).length);
      return songs;
    } catch (error) {
      console.error("Error getting trending songs:", error);
      return [];
    }
  }

  // Get recently released songs
  async getRecentSongs(): Promise<Song[]> {
    try {
      const tracks = await spotifyService.getNewReleases(15);
      return tracks
        .map((track) => this.convertSpotifyTrack(track))
        .filter((song): song is Song => song !== null);
    } catch (error) {
      console.error("Error getting recent songs:", error);
      return [];
    }
  }

  // Get favorite/popular songs
  async getFavoriteSongs(): Promise<Song[]> {
    try {
      const tracks = await spotifyService.searchTracks("best songs ever", 15);
      return tracks
        .map((track) => this.convertSpotifyTrack(track))
        .filter((song): song is Song => song !== null);
    } catch (error) {
      console.error("Error getting favorite songs:", error);
      return [];
    }
  }

  // Search for songs
  async searchSongs(query: string): Promise<Song[]> {
    try {
      const tracks = await spotifyService.searchTracks(query, 20);
      return tracks
        .map((track) => this.convertSpotifyTrack(track))
        .filter((song): song is Song => song !== null);
    } catch (error) {
      console.error("Error searching songs:", error);
      return [];
    }
  }

  // Get recommendations
  async getRecommendations(seedTracks: string[] = []): Promise<Song[]> {
    try {
      const tracks = await spotifyService.getRecommendations(seedTracks, [], 20);
      return tracks
        .map((track) => this.convertSpotifyTrack(track))
        .filter((song): song is Song => song !== null);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }

  // Get song by ID
  async getSongById(id: string): Promise<Song | null> {
    try {
      const tracks = await spotifyService.searchTracks(id, 1);
      if (tracks.length > 0) {
        return this.convertSpotifyTrack(tracks[0]);
      }
      return null;
    } catch (error) {
      console.error("Error getting song by ID:", error);
      return null;
    }
  }
}

export const songsService = new SongsService();
