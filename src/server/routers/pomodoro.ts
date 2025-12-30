import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const pomodoroSettingsSchema = z.object({
  workDuration: z.number().min(1).max(120).optional(),
  breakDuration: z.number().min(1).max(60).optional(),
  cycles: z.number().min(1).max(10).optional(),

  sessionStartSound: z.string().optional(),
  breakStartSound: z.string().optional(),
  breakEndSound: z.string().optional(),
  sessionEndSound: z.string().optional(),

  backgroundImage: z.string().nullable().optional(),
  backgroundType: z.enum(["gallery", "custom", "none"]).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),

  autoStartBreaks: z.boolean().optional(),
  autoStartPomodoros: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
});

export const pomodoroRouter = createTRPCRouter({
  // Get user settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    let settings = await ctx.db.pomodoroSettings.findUnique({
      where: { userId: ctx.userId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await ctx.db.pomodoroSettings.create({
        data: {
          userId: ctx.userId,
        },
      });
    }

    return settings;
  }),

  // Update settings
  updateSettings: protectedProcedure
    .input(pomodoroSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate custom background size if provided
      if (input.backgroundImage && input.backgroundType === "custom") {
        const sizeInBytes = (input.backgroundImage.length * 3) / 4;
        if (sizeInBytes > 500 * 1024) {
          throw new Error("Background image too large (max 500KB)");
        }
      }

      return await ctx.db.pomodoroSettings.upsert({
        where: { userId: ctx.userId },
        update: input,
        create: {
          userId: ctx.userId,
          ...input,
        },
      });
    }),

  // Reset to defaults
  resetSettings: protectedProcedure.mutation(async ({ ctx }) => {
    return await ctx.db.pomodoroSettings.update({
      where: { userId: ctx.userId },
      data: {
        workDuration: 50,
        breakDuration: 10,
        cycles: 3,
        sessionStartSound: "rythm-bell",
        breakStartSound: "completed",
        breakEndSound: "triangle",
        sessionEndSound: "victory-dance",
        backgroundImage: "cyan",
        backgroundType: "gallery",
        textColor: "#FFFFFF",
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
      },
    });
  }),
});
