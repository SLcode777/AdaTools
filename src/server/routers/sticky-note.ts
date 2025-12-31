import { db } from "@/src/lib/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const MAX_CONTENT_LENGTH = 20000;

export const stickyNoteRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const stickyNote = await db.stickyNote.findUnique({
      where: { userId: ctx.userId },
    });

    return stickyNote;
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        content: z.string().max(MAX_CONTENT_LENGTH, `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await db.stickyNote.upsert({
        where: { userId: ctx.userId },
        update: {
          content: input.content,
        },
        create: {
          userId: ctx.userId,
          content: input.content,
        },
      });
    }),
});
