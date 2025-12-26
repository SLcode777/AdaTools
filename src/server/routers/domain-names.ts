import { db } from "@/src/lib/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const domainNameSchema = z.object({
  domain: z.string().min(1, "Domain name is required"),
  registrar: z.string().min(1, "Registrar is required"),
  registrarUrl: z.string().url().optional().or(z.literal("")),
  expiresAt: z.date(),
  autoRenew: z.boolean().default(false),
  reminderOneMonth: z.boolean().default(true),
  reminderOneWeek: z.boolean().default(true),
});

export const domainNamesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db.domainName.findMany({
      where: { userId: ctx.userId },
      orderBy: { expiresAt: "asc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const domain = await db.domainName.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!domain) {
        throw new Error("Domain not found");
      }

      return domain;
    }),

  create: protectedProcedure
    .input(domainNameSchema)
    .mutation(async ({ ctx, input }) => {
      return await db.domainName.create({
        data: {
          userId: ctx.userId,
          ...input,
          registrarUrl: input.registrarUrl || null,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: domainNameSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.domainName.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Domain not found");
      }

      return await db.domainName.update({
        where: { id: input.id },
        data: {
          ...input.data,
          registrarUrl: input.data.registrarUrl || null,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.domainName.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Domain not found");
      }

      await db.domainName.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getExpiringDomains: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    return await db.domainName.findMany({
      where: {
        userId: ctx.userId,
        expiresAt: {
          lte: oneMonthFromNow,
          gte: now,
        },
      },
      orderBy: { expiresAt: "asc" },
    });
  }),
});
