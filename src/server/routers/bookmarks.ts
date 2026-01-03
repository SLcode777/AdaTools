import { db } from "@/src/lib/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { extractMetadata } from "../services/metadata-extractor";
import {
  generateBookmarksHTML,
  parseBookmarksHTML,
} from "../services/bookmark-html";

const bookmarkSchema = z.object({
  url: z.string().url("Invalid URL format"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  favicon: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
});

export const bookmarksRouter = createTRPCRouter({
  // Get all user's bookmarks with filters
  getAll: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          tag: z.string().optional(),
          favoritesOnly: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: {
        userId: string;
        isFavorite?: boolean;
        tags?: { has: string };
        OR?: Array<{
          title?: { contains: string; mode: "insensitive" };
          description?: { contains: string; mode: "insensitive" };
          url?: { contains: string; mode: "insensitive" };
        }>;
      } = {
        userId: ctx.userId,
      };

      if (input?.favoritesOnly) {
        where.isFavorite = true;
      }

      if (input?.tag) {
        where.tags = {
          has: input.tag,
        };
      }

      if (input?.search) {
        where.OR = [
          {
            title: {
              contains: input.search,
              mode: "insensitive" as const,
            },
          },
          {
            description: {
              contains: input.search,
              mode: "insensitive" as const,
            },
          },
          {
            url: {
              contains: input.search,
              mode: "insensitive" as const,
            },
          },
        ];
      }

      return await db.bookmark.findMany({
        where,
        orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
      });
    }),

  // Get specific bookmark by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bookmark = await db.bookmark.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!bookmark) {
        throw new Error("Bookmark not found");
      }

      return bookmark;
    }),

  // Fetch metadata from URL
  fetchMetadata: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      const metadata = await extractMetadata(input.url);
      return metadata;
    }),

  // Create new bookmark
  create: protectedProcedure
    .input(bookmarkSchema)
    .mutation(async ({ ctx, input }) => {
      return await db.bookmark.create({
        data: {
          userId: ctx.userId,
          ...input,
        },
      });
    }),

  // Update bookmark
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: bookmarkSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.bookmark.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Bookmark not found");
      }

      return await db.bookmark.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Delete bookmark
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.bookmark.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Bookmark not found");
      }

      await db.bookmark.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle favorite
  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bookmark = await db.bookmark.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!bookmark) {
        throw new Error("Bookmark not found");
      }

      return await db.bookmark.update({
        where: { id: input.id },
        data: { isFavorite: !bookmark.isFavorite },
      });
    }),

  // Get all unique tags used by user
  getTags: protectedProcedure.query(async ({ ctx }) => {
    const bookmarks = await db.bookmark.findMany({
      where: { userId: ctx.userId },
      select: { tags: true },
    });

    const allTags = bookmarks.flatMap((b) => b.tags);
    const uniqueTags = Array.from(new Set(allTags)).sort();

    return uniqueTags;
  }),

  // Parse HTML file and return bookmarks for user selection
  parseHTMLFile: protectedProcedure
    .input(z.object({ html: z.string() }))
    .mutation(async ({ input }) => {
      const parsedBookmarks = parseBookmarksHTML(input.html);
      return parsedBookmarks;
    }),

  // Import selected bookmarks
  importBookmarks: protectedProcedure
    .input(
      z.object({
        bookmarks: z.array(
          z.object({
            url: z.string(),
            title: z.string(),
            favicon: z.string().optional(),
            tags: z.array(z.string()).default([]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await db.bookmark.createMany({
        data: input.bookmarks.map((bookmark) => ({
          userId: ctx.userId,
          url: bookmark.url,
          title: bookmark.title,
          favicon: bookmark.favicon || undefined,
          tags: bookmark.tags,
          isFavorite: false,
        })),
      });

      return { count: created.count };
    }),

  // Export all bookmarks as HTML
  exportHTML: protectedProcedure.query(async ({ ctx }) => {
    const bookmarks = await db.bookmark.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      select: {
        url: true,
        title: true,
        description: true,
        favicon: true,
        tags: true,
      },
    });

    return generateBookmarksHTML(bookmarks);
  }),
});
