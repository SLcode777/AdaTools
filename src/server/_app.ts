import { db } from "@/src/lib/db";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./trpc";

export const appRouter = router({
  greeting: publicProcedure.query(() => "hello tRPC v10!"),

  modules: router({
    getPinned: protectedProcedure.query(async ({ ctx }) => {
      const workspace = await db.workspace.findUnique({
        where: { userId: ctx.session.user.id },
        select: { pinnedModules: true },
      });

      // If no workspace, return default modules
      return workspace?.pinnedModules ?? ["lorem-ipsum", "uuid", "base64"];
    }),

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

        // Toggle module
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
  }),
});

export type AppRouter = typeof appRouter;
