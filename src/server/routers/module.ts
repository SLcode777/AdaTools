import { db } from "@/src/lib/db";
import type { Prisma } from "@prisma/client";
import {
  DEFAULT_MODULE_LAYOUTS,
  type ModuleLayouts,
  type ModuleOrder,
  type ColumnCount,
  getLayoutForColumnCount,
  updateLayoutInLayouts,
} from "@/src/types/module-order";
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

      // Get or create workspace (only select pinnedModules to avoid moduleOrder parsing issues)
      let workspace = await db.workspace.findUnique({
        where: { userId },
        select: { pinnedModules: true, id: true },
      });

      if (!workspace) {
        workspace = await db.workspace.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            pinnedModules: [],
          },
          select: { pinnedModules: true, id: true },
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

  // Get all module layouts
  getModuleLayouts: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await db.workspace.findUnique({
      where: { userId: ctx.session.user.id },
      select: { moduleLayouts: true },
    });

    if (!workspace?.moduleLayouts) {
      return DEFAULT_MODULE_LAYOUTS;
    }

    // Parse JSON and validate structure
    const layouts = workspace.moduleLayouts as unknown as ModuleLayouts;
    return layouts;
  }),

  // Get module order for specific column count
  getModuleOrder: protectedProcedure
    .input(z.object({ columnCount: z.number().min(1).max(5) }))
    .query(async ({ ctx, input }) => {
      const workspace = await db.workspace.findUnique({
        where: { userId: ctx.session.user.id },
        select: { moduleLayouts: true },
      });

      if (!workspace?.moduleLayouts) {
        return getLayoutForColumnCount(
          DEFAULT_MODULE_LAYOUTS,
          input.columnCount as ColumnCount
        );
      }

      const layouts = workspace.moduleLayouts as unknown as ModuleLayouts;
      return getLayoutForColumnCount(layouts, input.columnCount as ColumnCount);
    }),

  // Update module order for specific column count
  updateModuleOrder: protectedProcedure
    .input(
      z.object({
        columnCount: z.number().min(1).max(5),
        moduleOrder: z.object({
          col1: z.array(z.string()),
          col2: z.array(z.string()),
          col3: z.array(z.string()),
          col4: z.array(z.string()),
          col5: z.array(z.string()),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get or create workspace
      let workspace = await db.workspace.findUnique({
        where: { userId },
        select: { moduleLayouts: true, id: true },
      });

      const currentLayouts = workspace?.moduleLayouts
        ? (workspace.moduleLayouts as unknown as ModuleLayouts)
        : DEFAULT_MODULE_LAYOUTS;

      // Update only the layout for this column count
      const updatedLayouts = updateLayoutInLayouts(
        currentLayouts,
        input.columnCount as ColumnCount,
        input.moduleOrder
      );

      if (!workspace) {
        workspace = await db.workspace.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            pinnedModules: [],
            moduleLayouts: updatedLayouts as unknown as Prisma.InputJsonValue,
          },
          select: { moduleLayouts: true, id: true },
        });
      } else {
        workspace = await db.workspace.update({
          where: { userId },
          data: { moduleLayouts: updatedLayouts as unknown as Prisma.InputJsonValue },
          select: { moduleLayouts: true, id: true },
        });
      }

      return workspace.moduleLayouts as unknown as ModuleLayouts;
    }),
});
