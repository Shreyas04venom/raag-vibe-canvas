import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

/**
 * Recommend a music mix based on current weather conditions and mood.
 * Core RaagWeather feature — matches weather to Indian-inspired playlists.
 */
export default defineTool({
  name: "get_weather_recommendations",
  title: "Get weather-based music recommendations",
  description:
    "Recommend a music playlist tailored to a weather condition (e.g. rainy, sunny, cloudy).",
  inputSchema: {
    weather: z
      .enum(["sunny", "rainy", "cloudy", "snowy", "windy", "stormy"])
      .describe("Current weather condition."),
    mood: z
      .enum(["romantic", "energetic", "chill", "devotional", "party", "melancholic"])
      .nullable()
      .describe("Optional mood filter."),
    language: z
      .enum(["hindi", "english", "tamil", "telugu", "punjabi", "marathi"])
      .default("hindi")
      .describe("Preferred song language."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ weather, mood, language }) => {
    // Map weather → playlist blueprint (demo logic; a real backend would query curated data)
    const playlistMap: Record<string, { name: string; vibe: string; songs: string[] }> = {
      rainy: {
        name: "Monsoon Melodies",
        vibe: "Soulful ballads for cozy rainy days",
        songs: ["Tum Hi Ho", "Kesariya", "Raataan Lambiyan", "Channa Mereya"],
      },
      sunny: {
        name: "Sunshine Grooves",
        vibe: "Upbeat tracks to match the bright sky",
        songs: ["Kala Chashma", "Badtameez Dil", "Malhari", "Nashe Si Chadh Gayi"],
      },
      cloudy: {
        name: "Overcast Reflections",
        vibe: "Mellow acoustics for a thoughtful day",
        songs: ["Agar Tum Saath Ho", "Phir Le Aya Dil", "Kabira", "Tere Sang Yaara"],
      },
      snowy: {
        name: "Winter Warmth",
        vibe: "Warm classics for chilly evenings",
        songs: ["Perhaps Love", "Jab Koi Baat", "Tum Se Hi", "Pehla Nasha"],
      },
      windy: {
        name: "Free Spirit",
        vibe: "Breezy tracks to match the wind",
        songs: ["Ilahi", "Patakha Guddi", "Zinda", "Yeh Jawaani Hai Deewani"],
      },
      stormy: {
        name: "Thunder & Rhythm",
        vibe: "Intense beats for dramatic weather",
        songs: ["Malhari", "Ghungroo", "Sher Aaya Sher", "Apna Time Aayega"],
      },
    };

    const playlist = playlistMap[weather];
    const moodNote = mood ? ` filtered for a ${mood} mood` : "";

    return {
      content: [
        {
          type: "text",
          text: `Playlist "${playlist.name}" — ${playlist.vibe}${moodNote}. Language: ${language}. Includes: ${playlist.songs.join(", ")}.`,
        },
      ],
      structuredContent: {
        playlist_name: playlist.name,
        vibe: playlist.vibe,
        weather,
        mood,
        language,
        songs: playlist.songs,
      },
    };
  },
});
