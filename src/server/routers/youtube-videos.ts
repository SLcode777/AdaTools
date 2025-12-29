import { db } from "@/src/lib/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// Helper function to extract YouTube video ID and playlist ID from various URL formats
function extractYouTubeInfo(url: string): {
  videoId: string | null;
  playlistId: string | null;
  isPlaylist: boolean;
} {
  // Extract playlist ID if present
  const playlistRegex = /[?&]list=([^&]+)/;
  const playlistMatch = url.match(playlistRegex);
  const playlistId = playlistMatch ? playlistMatch[1] : null;

  // Check if this is a pure playlist URL (no video ID)
  const purePlaylistRegex = /youtube\.com\/playlist\?list=/;
  const isPurePlaylist = purePlaylistRegex.test(url);

  if (isPurePlaylist && playlistId) {
    return {
      videoId: "", // Empty string for pure playlists
      playlistId,
      isPlaylist: true,
    };
  }

  // Extract video ID
  let videoId: string | null = null;

  // Handle youtube.com/watch?v=VIDEO_ID
  const watchRegex = /[?&]v=([^&]+)/;
  const watchMatch = url.match(watchRegex);
  if (watchMatch) videoId = watchMatch[1];

  // Handle youtu.be/VIDEO_ID
  if (!videoId) {
    const shortRegex = /youtu\.be\/([^?]+)/;
    const shortMatch = url.match(shortRegex);
    if (shortMatch) videoId = shortMatch[1];
  }

  // Handle youtube.com/embed/VIDEO_ID
  if (!videoId) {
    const embedRegex = /youtube\.com\/embed\/([^?]+)/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch) videoId = embedMatch[1];
  }

  return {
    videoId,
    playlistId,
    isPlaylist: !!playlistId, // It's a playlist if playlistId exists
  };
}

const youtubeVideoSchema = z.object({
  url: z
    .string()
    .url("Invalid URL format")
    .refine((url) => {
      const info = extractYouTubeInfo(url);
      return info.videoId !== null || info.isPlaylist;
    }, {
      message: "Invalid YouTube URL",
    }),
  title: z.string().min(1, "Title is required").max(200),
});

export const youtubeVideosRouter = createTRPCRouter({
  // Get all user's videos
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db.youTubeVideo.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get specific video by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const video = await db.youTubeVideo.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!video) {
        throw new Error("Video not found");
      }

      return video;
    }),

  // Create new video
  create: protectedProcedure
    .input(youtubeVideoSchema)
    .mutation(async ({ ctx, input }) => {
      const info = extractYouTubeInfo(input.url);

      if (!info.videoId && !info.isPlaylist) {
        throw new Error("Could not extract video ID or playlist ID from URL");
      }

      return await db.youTubeVideo.create({
        data: {
          userId: ctx.userId,
          url: input.url,
          title: input.title,
          videoId: info.videoId || "",
          playlistId: info.playlistId,
          isPlaylist: info.isPlaylist,
        },
      });
    }),

  // Update video
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: youtubeVideoSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.youTubeVideo.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Video not found");
      }

      const updateData: any = { ...input.data };

      // If URL is being updated, re-extract info
      if (input.data.url) {
        const info = extractYouTubeInfo(input.data.url);
        if (!info.videoId && !info.isPlaylist) {
          throw new Error("Could not extract video ID or playlist ID from URL");
        }
        updateData.videoId = info.videoId || "";
        updateData.playlistId = info.playlistId;
        updateData.isPlaylist = info.isPlaylist;
      }

      return await db.youTubeVideo.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  // Delete video
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.youTubeVideo.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Video not found");
      }

      await db.youTubeVideo.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
