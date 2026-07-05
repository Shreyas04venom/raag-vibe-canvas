import { defineMcp } from "@lovable.dev/mcp-js";
import searchMusicTool from "./tools/search-music";
import weatherRecommendationsTool from "./tools/weather-recommendations";
import getTrendingTool from "./tools/get-trending";
import createPlaylistTool from "./tools/create-playlist";

/**
 * RaagWeather MCP server definition.
 *
 * Exposes music discovery, weather-based recommendations, trending charts, and
 * playlist creation to any MCP-compatible AI client (ChatGPT, Claude, Cursor, etc.).
 *
 * No `auth` is set — the demo catalog is public. Add `auth.oauth.issuer(...)`
 * before exposing per-user data (favorites, private playlists, listening history).
 */
export default defineMcp({
  name: "raagweather-mcp",
  title: "RaagWeather MCP",
  version: "0.1.0",
  instructions:
    "Tools for RaagWeather — a weather-driven music streaming app. Use `search_music` to look up songs, artists, or albums; `get_weather_recommendations` to build a playlist tailored to current weather and mood; `get_trending` for the latest charts by region/genre; and `create_playlist` to draft a new playlist. Prefer weather recommendations when the user mentions how they feel or what the sky looks like.",
  tools: [
    searchMusicTool,
    weatherRecommendationsTool,
    getTrendingTool,
    createPlaylistTool,
  ],
});
