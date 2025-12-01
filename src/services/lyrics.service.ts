// Service to fetch lyrics from Genius API or other sources
// For now, we'll use Lyrics.ovh API which is free and doesn't require authentication

export interface LyricsResponse {
  lyrics: string;
  track: string;
  artist: string;
}

class LyricsService {
  // Get lyrics from Lyrics.ovh API
  async getLyrics(artist: string, title: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );

      if (!response.ok) {
        throw new Error("Lyrics not found");
      }

      const data = await response.json();
      return data.lyrics || null;
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      return null;
    }
  }

  // Get lyrics with fallback
  async getLyricsWithFallback(artist: string, title: string): Promise<LyricsResponse | null> {
    try {
      const lyrics = await this.getLyrics(artist, title);
      
      if (lyrics) {
        return {
          lyrics,
          track: title,
          artist,
        };
      }

      // If lyrics not found, return null
      return null;
    } catch (error) {
      console.error("Error fetching lyrics with fallback:", error);
      return null;
    }
  }

  // Format lyrics for display (add line breaks, etc.)
  formatLyrics(lyrics: string): string {
    return lyrics
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  }
}

export const lyricsService = new LyricsService();
