import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

/**
 * Fetch trending songs by region and genre on RaagWeather right now.
 */
export default defineTool({
  name: "get_trending",
  title: "Get trending songs",
  description: "List trending songs on RaagWeather filtered by region and genre.",
  inputSchema: {
    region: z
      .enum(["bollywood", "tollywood", "hollywood", "regional", "global"])
      .default("bollywood")
      .describe("Region / industry filter."),
    genre: z
      .enum(["romantic", "dance", "chill", "devotional", "party", "all"])
      .default("all")
      .describe("Optional genre filter."),
    limit: z.number().int().min(1).max(20).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ region, genre, limit }) => {
    const trending = [
      { rank: 1, title: "Kesariya", artist: "Arijit Singh", region: "bollywood", genre: "romantic" },
      { rank: 2, title: "Apna Bana Le", artist: "Arijit Singh", region: "bollywood", genre: "romantic" },
      { rank: 3, title: "Kala Chashma", artist: "Badshah", region: "bollywood", genre: "dance" },
      { rank: 4, title: "Malhari", artist: "Vishal Dadlani", region: "bollywood", genre: "party" },
      { rank: 5, title: "Naatu Naatu", artist: "Rahul Sipligunj", region: "tollywood", genre: "dance" },
      { rank: 6, title: "Blinding Lights", artist: "The Weeknd", region: "hollywood", genre: "dance" },
      { rank: 7, title: "Tum Hi Ho", artist: "Arijit Singh", region: "bollywood", genre: "romantic" },
      { rank: 8, title: "Ghungroo", artist: "Arijit Singh", region: "bollywood", genre: "dance" },
    ];

    const results = trending
      .filter((s) => region === "global" || s.region === region)
      .filter((s) => genre === "all" || s.genre === genre)
      .slice(0, limit);

    return {
      content: [
        {
          type: "text",
          text: `Top ${results.length} trending ${region} ${genre === "all" ? "" : genre + " "}songs.`,
        },
      ],
      structuredContent: { trending: results, region, genre },
    };
  },
});
