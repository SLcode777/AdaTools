import { db } from "@/src/lib/db";
import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const DEFAULT_MODULES = ["lorem-ipsum", "uuid", "base64"];

export const moduleRouter = createTRPCRouter({
  // Get pinned modules - public so it works without auth
  getPinned: publicProcedure.query(async ({ ctx }) => {
    // If not authenticated, return defaults
    if (!ctx.session?.user?.id) {
      return DEFAULT_MODULES;
    }

    const workspace = await db.workspace.findUnique({
      where: { userId: ctx.session.user.id },
      select: { pinnedModules: true },
    });

    // If no workspace, return default modules
    return workspace?.pinnedModules ?? DEFAULT_MODULES;
  }),

  // Toggle pin on/off
  togglePin: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get or create workspace
      let workspace = await db.workspace.findUnique({
        where: { userId },
      });

      if (!workspace) {
        workspace = await db.workspace.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            pinnedModules: [],
          },
        });
      }

      const pinnedModules = workspace.pinnedModules;
      const moduleIndex = pinnedModules.indexOf(input.moduleId);

      if (moduleIndex > -1) {
        pinnedModules.splice(moduleIndex, 1);
      } else {
        pinnedModules.push(input.moduleId);
      }

      // Update workspace
      const updated = await db.workspace.update({
        where: { userId },
        data: { pinnedModules },
        select: { pinnedModules: true },
      });

      return updated.pinnedModules;
    }),
});
