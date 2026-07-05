import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

/**
 * Search the RaagWeather music catalog for songs, artists, or albums.
 * Returns a curated list matching the query with metadata.
 */
export default defineTool({
  name: "search_music",
  title: "Search music",
  description:
    "Search the RaagWeather catalog for songs, artists, or albums by keyword.",
  inputSchema: {
    query: z.string().min(1).describe("The search term (song title, artist, or album)."),
    type: z
      .enum(["track", "artist", "album", "all"])
      .default("all")
      .describe("Restrict results to a specific entity type."),
    limit: z.number().int().min(1).max(50).default(10).describe("Max results."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, type, limit }) => {
    // Demo catalog — replace with real backend search when wired up.
    const catalog = [
      { id: "1", title: "Tum Hi Ho", artist: "Arijit Singh", album: "Aashiqui 2", type: "track" },
      { id: "2", title: "Kesariya", artist: "Arijit Singh", album: "Brahmastra", type: "track" },
      { id: "3", title: "Apna Bana Le", artist: "Arijit Singh", album: "Bhediya", type: "track" },
      { id: "4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal", album: "Shershaah", type: "track" },
      { id: "5", title: "Arijit Singh", artist: "Arijit Singh", album: "", type: "artist" },
      { id: "6", title: "AR Rahman", artist: "AR Rahman", album: "", type: "artist" },
    ];

    const q = query.toLowerCase();
    const results = catalog
      .filter((item) => type === "all" || item.type === type)
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.artist.toLowerCase().includes(q) ||
          item.album.toLowerCase().includes(q)
      )
      .slice(0, limit);

    return {
      content: [{ type: "text", text: `Found ${results.length} result(s) for "${query}".` }],
      structuredContent: { results, query, type },
    };
  },
});
