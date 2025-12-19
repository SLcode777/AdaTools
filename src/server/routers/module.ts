import { db } from "@/src/lib/db";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const moduleRouter = createTRPCRouter({
  // Get pinned modules
  getPinned: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await db.workspace.findUnique({
      where: { userId: ctx.session.user.id },
      select: { pinnedModules: true },
    });

    // If no workspace, return default modules
    return workspace?.pinnedModules ?? ["lorem-ipsum", "uuid", "base64"];
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
