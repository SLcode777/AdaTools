import { db } from "@/src/lib/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const snippetSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
});

export const snippetsRouter = createTRPCRouter({
  // Get all user's snippets
  getAll: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          language: z.string().optional(),
          tag: z.string().optional(),
          favoritesOnly: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.userId,
      };

      if (input?.favoritesOnly) {
        where.isFavorite = true;
      }

      if (input?.language) {
        where.language = input.language;
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
            code: {
              contains: input.search,
              mode: "insensitive" as const,
            },
          },
        ];
      }

      return await db.snippet.findMany({
        where,
        orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
      });
    }),

  // Get specific snippet by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const snippet = await db.snippet.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!snippet) {
        throw new Error("Snippet not found");
      }

      return snippet;
    }),

  // Create new snippet
  create: protectedProcedure
    .input(snippetSchema)
    .mutation(async ({ ctx, input }) => {
      return await db.snippet.create({
        data: {
          userId: ctx.userId,
          ...input,
        },
      });
    }),

  // Update snippet
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: snippetSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Snippet not found");
      }

      return await db.snippet.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Delete snippet
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Snippet not found");
      }

      await db.snippet.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle favorite
  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const snippet = await db.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!snippet) {
        throw new Error("Snippet not found");
      }

      return await db.snippet.update({
        where: { id: input.id },
        data: { isFavorite: !snippet.isFavorite },
      });
    }),

  // Get all unique languages used by user
  getLanguages: protectedProcedure.query(async ({ ctx }) => {
    const snippets = await db.snippet.findMany({
      where: { userId: ctx.userId },
      select: { language: true },
      distinct: ["language"],
      orderBy: { language: "asc" },
    });

    return snippets.map((s) => s.language);
  }),

  // Get all unique tags used by user
  getTags: protectedProcedure.query(async ({ ctx }) => {
    const snippets = await db.snippet.findMany({
      where: { userId: ctx.userId },
      select: { tags: true },
    });

    const allTags = snippets.flatMap((s) => s.tags);
    const uniqueTags = Array.from(new Set(allTags)).sort();

    return uniqueTags;
  }),

  // Mark snippet as used (updates lastUsedAt)
  markAsUsed: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const snippet = await db.snippet.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!snippet) {
        throw new Error("Snippet not found");
      }

      return await db.snippet.update({
        where: { id: input.id },
        data: { lastUsedAt: new Date() },
      });
    }),

  // Get recently used snippets
  getRecentlyUsed: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }).optional())
    .query(async ({ ctx, input }) => {
      return await db.snippet.findMany({
        where: {
          userId: ctx.userId,
          lastUsedAt: { not: null },
        },
        orderBy: { lastUsedAt: "desc" },
        take: input?.limit || 5,
      });
    }),

  // Export all snippets as JSON
  exportAll: protectedProcedure.query(async ({ ctx }) => {
    const snippets = await db.snippet.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        description: true,
        language: true,
        code: true,
        tags: true,
        isFavorite: true,
        createdAt: true,
      },
    });

    return snippets;
  }),

  // Import snippets from JSON
  importSnippets: protectedProcedure
    .input(
      z.object({
        snippets: z.array(
          z.object({
            title: z.string(),
            description: z.string().optional().nullable(),
            language: z.string(),
            code: z.string(),
            tags: z.array(z.string()).default([]),
            isFavorite: z.boolean().default(false),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await db.snippet.createMany({
        data: input.snippets.map((snippet) => ({
          userId: ctx.userId,
          title: snippet.title,
          description: snippet.description || undefined,
          language: snippet.language,
          code: snippet.code,
          tags: snippet.tags,
          isFavorite: snippet.isFavorite,
        })),
      });

      return { count: created.count };
    }),
});
