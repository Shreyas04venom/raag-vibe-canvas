import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

/**
 * Create a new playlist blueprint on RaagWeather.
 * Demo tool — returns the playlist that would be created; wire to Supabase to persist.
 */
export default defineTool({
  name: "create_playlist",
  title: "Create playlist",
  description:
    "Create a new playlist with a name, description, and initial list of track titles.",
  inputSchema: {
    name: z.string().min(1).max(80).describe("Playlist name."),
    description: z.string().max(280).nullable().describe("Optional description."),
    trackTitles: z
      .array(z.string().min(1))
      .max(50)
      .default([])
      .describe("Initial track titles to add to the playlist."),
    isPublic: z.boolean().default(true).describe("Whether the playlist is publicly shareable."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: ({ name, description, trackTitles, isPublic }) => {
    const playlist = {
      id: `pl_${Date.now()}`,
      name,
      description: description ?? "",
      trackTitles,
      trackCount: trackTitles.length,
      isPublic,
      createdAt: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: "text",
          text: `Playlist "${name}" created with ${trackTitles.length} track(s). Visibility: ${isPublic ? "public" : "private"}.`,
        },
      ],
      structuredContent: { playlist },
    };
  },
});
