import { db } from "@/src/lib/db";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const analyticsRouter = createTRPCRouter({
  // Track an event (create new entry each time)
  trackEvent: publicProcedure
    .input(
      z.object({
        eventType: z.string(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const event = await db.analyticsEvent.create({
        data: {
          eventType: input.eventType,
          userId: ctx.userId || null,
          metadata: input.metadata || null,
        },
      });

      return event;
    }),

  // Get total count for an event type
  getStats: publicProcedure
    .input(
      z.object({
        eventType: z.string(),
      })
    )
    .query(async ({ input }) => {
      const count = await db.analyticsEvent.count({
        where: { eventType: input.eventType },
      });

      return {
        eventType: input.eventType,
        count,
      };
    }),

  // Get stats grouped by date (for charts later)
  getStatsByDate: publicProcedure
    .input(
      z.object({
        eventType: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const events = await db.analyticsEvent.findMany({
        where: {
          eventType: input.eventType,
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return events;
    }),

  // Get all event types with counts (for admin dashboard)
  getAllStats: publicProcedure.query(async () => {
    const events = await db.analyticsEvent.groupBy({
      by: ["eventType"],
      _count: {
        eventType: true,
      },
      orderBy: {
        _count: {
          eventType: "desc",
        },
      },
    });

    return events.map((event) => ({
      eventType: event.eventType,
      count: event._count.eventType,
    }));
  }),
});
