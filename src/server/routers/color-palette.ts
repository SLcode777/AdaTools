import { db } from "@/src/lib/db";
import type { ColorEntry } from "@/src/types/color-palette";
import type { Prisma } from "@prisma/client";
import chroma from "chroma-js";
import { Vibrant } from "node-vibrant/node";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// Validation schemas
const colorEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  hex: z.string().regex(/^#[0-9A-F]{6}$/i), // Always HEX format
  displayValue: z.string().optional(), // Optional: original format typed by user
});

const colorPaletteSchema = z.object({
  name: z.string().min(1).max(100),
  colors: z.array(colorEntrySchema).min(1).max(50),
});

export const colorPaletteRouter = createTRPCRouter({
  // Get all user's palettes
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const palettes = await db.colorPalette.findMany({
      where: { userId: ctx.userId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return palettes.map((p) => ({
      ...p,
      colors: p.colors as unknown as ColorEntry[],
    }));
  }),

  // Get specific palette by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const palette = await db.colorPalette.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!palette) {
        throw new Error("Palette not found");
      }

      return {
        ...palette,
        colors: palette.colors as unknown as ColorEntry[],
      };
    }),

  // Create new palette
  create: protectedProcedure
    .input(colorPaletteSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if this is user's first palette
      const existingCount = await db.colorPalette.count({
        where: { userId },
      });

      const palette = await db.colorPalette.create({
        data: {
          userId,
          name: input.name,
          colors: input.colors as Prisma.InputJsonValue,
          isDefault: existingCount === 0,
        },
      });

      return {
        ...palette,
        colors: palette.colors as unknown as ColorEntry[],
      };
    }),

  // Update palette
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        colors: z.array(colorEntrySchema).min(1).max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existing = await db.colorPalette.findFirst({
        where: { id, userId: ctx.userId },
      });

      if (!existing) {
        throw new Error("Palette not found");
      }

      const palette = await db.colorPalette.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.colors && {
            colors: updateData.colors as Prisma.InputJsonValue,
          }),
        },
      });

      return {
        ...palette,
        colors: palette.colors as unknown as ColorEntry[],
      };
    }),

  // Delete palette
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Verify ownership
      const existing = await db.colorPalette.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) {
        throw new Error("Palette not found");
      }

      // If deleting default palette, set another as default
      if (existing.isDefault) {
        const nextPalette = await db.colorPalette.findFirst({
          where: {
            userId,
            id: { not: input.id },
          },
          orderBy: { updatedAt: "desc" },
        });

        if (nextPalette) {
          await db.colorPalette.update({
            where: { id: nextPalette.id },
            data: { isDefault: true },
          });
        }
      }

      await db.colorPalette.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Set default palette
  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Verify ownership
      const palette = await db.colorPalette.findFirst({
        where: { id: input.id, userId },
      });

      if (!palette) {
        throw new Error("Palette not found");
      }

      // Unset current default
      await db.colorPalette.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // Set new default
      await db.colorPalette.update({
        where: { id: input.id },
        data: { isDefault: true },
      });

      return { success: true };
    }),

  // Import from image
  importFromImage: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        colorCount: z.number().min(1).max(10).default(6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Extract base64 data
        const base64Data = input.imageBase64.split(",")[1] || input.imageBase64;
        const buffer = Buffer.from(base64Data, "base64");

        // Extract colors using Vibrant
        const palette = await Vibrant.from(buffer).getPalette();

        const colors: ColorEntry[] = [];
        const swatchNames = [
          "Vibrant",
          "Dark Vibrant",
          "Light Vibrant",
          "Muted",
          "Dark Muted",
          "Light Muted",
        ];

        let index = 0;
        for (const [, swatch] of Object.entries(palette)) {
          if (
            swatch &&
            typeof swatch === "object" &&
            "hex" in swatch &&
            colors.length < input.colorCount
          ) {
            colors.push({
              id: crypto.randomUUID(),
              name: swatchNames[index] || `Color ${index + 1}`,
              hex: (swatch as { hex: string }).hex.toUpperCase(),
            });
            index++;
          }
        }

        return {
          colors,
          suggestedName: `Palette ${new Date().toLocaleDateString()}`,
        };
      } catch (error) {
        console.error("Error extracting colors from image:", error);
        throw new Error("Failed to extract colors from image");
      }
    }),

  // Import from CSS
  importFromCSS: protectedProcedure
    .input(
      z.object({
        cssContent: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const colors: ColorEntry[] = [];
        const uniqueColors = new Set<string>();

        // Regex patterns for color extraction
        const hexPattern = /#([0-9A-F]{6}|[0-9A-F]{3})\b/gi;
        const rgbPattern = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;
        const hslPattern = /hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/gi;
        const oklchPattern =
          /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.%]+)?\s*\)/gi;
        // Tailwind/shadcn format: --name: h s% l% (space-separated HSL)
        const hslSpacedPattern =
          /--([a-z0-9-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/gi;
        const varPattern =
          /--([a-z0-9-]+):\s*(#[0-9A-F]{6}|rgb\([^)]+\)|hsl\([^)]+\)|oklch\([^)]+\))/gi;

        // Extract CSS variable names and convert to hex for mapping
        const hexToVarName = new Map<string, string>();
        let match;

        // First, extract space-separated HSL variables (Tailwind/shadcn format)
        while ((match = hslSpacedPattern.exec(input.cssContent)) !== null) {
          const [, varName, h, s, l] = match;
          try {
            const hex = chroma
              .hsl(parseFloat(h), parseFloat(s) / 100, parseFloat(l) / 100)
              .hex()
              .toUpperCase();
            hexToVarName.set(hex, varName);
            uniqueColors.add(hex);
          } catch (error) {
            console.warn(
              "Failed to parse spaced HSL variable:",
              varName,
              error
            );
          }
        }

        // Extract other CSS variables (hex, rgb, hsl, oklch with parentheses)
        while ((match = varPattern.exec(input.cssContent)) !== null) {
          const [, varName, colorValue] = match;
          try {
            // Convert the color value to HEX for mapping
            const hex = chroma(colorValue).hex().toUpperCase();
            hexToVarName.set(hex, varName);
          } catch (error) {
            console.warn(
              "Failed to parse CSS variable color:",
              varName,
              colorValue,
              error
            );
          }
        }

        // Extract hex colors
        input.cssContent.replace(hexPattern, (matchStr) => {
          let hex = matchStr.toUpperCase();
          // Convert 3-digit hex to 6-digit
          if (hex.length === 4) {
            hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
          }
          if (!uniqueColors.has(hex)) {
            uniqueColors.add(hex);
          }
          return matchStr;
        });

        // Extract RGB colors
        input.cssContent.replace(rgbPattern, (matchStr, r, g, b) => {
          const hex = chroma(parseInt(r), parseInt(g), parseInt(b))
            .hex()
            .toUpperCase();
          if (!uniqueColors.has(hex)) {
            uniqueColors.add(hex);
          }
          return matchStr;
        });

        // Extract HSL colors
        input.cssContent.replace(hslPattern, (matchStr, h, s, l) => {
          const hex = chroma
            .hsl(parseInt(h), parseInt(s) / 100, parseInt(l) / 100)
            .hex()
            .toUpperCase();
          if (!uniqueColors.has(hex)) {
            uniqueColors.add(hex);
          }
          return matchStr;
        });

        // Extract OKLCH colors
        input.cssContent.replace(oklchPattern, (matchStr, l, c, h) => {
          try {
            const hex = chroma
              .oklch(parseFloat(l), parseFloat(c), parseFloat(h))
              .hex()
              .toUpperCase();
            if (!uniqueColors.has(hex)) {
              uniqueColors.add(hex);
            }
          } catch (error) {
            console.warn("Failed to parse OKLCH color:", matchStr, error);
          }
          return matchStr;
        });

        // Create color entries
        let index = 0;
        for (const hex of uniqueColors) {
          if (index >= 50) break; // Max 50 colors

          // Try to find variable name for this color
          let name = `Color ${index + 1}`;
          const varName = hexToVarName.get(hex);
          if (varName) {
            name = varName
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
          }

          colors.push({
            id: crypto.randomUUID(),
            name,
            hex,
          });
          index++;
        }

        return {
          colors,
          suggestedName: "Imported from CSS",
        };
      } catch (error) {
        console.error("Error parsing CSS:", error);
        throw new Error("Failed to parse CSS file");
      }
    }),

  // Convert color to all formats
  convertColor: protectedProcedure
    .input(
      z.object({
        hex: z.string().min(1), // Accept any color format (hex, rgb, hsl, oklch, etc.)
        name: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        const color = chroma(input.hex);

        // RGB
        const [r, g, b] = color.rgb();
        const rgb = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

        // HSL
        const [h, s, l] = color.hsl();
        const hsl = `hsl(${Math.round(h || 0)}deg, ${Math.round(
          (s || 0) * 100
        )}%, ${Math.round(l * 100)}%)`;

        // OKLCH
        const [lOk, c, hOk] = color.oklch();
        const oklch = `oklch(${lOk.toFixed(2)} ${c.toFixed(3)} ${(
          hOk || 0
        ).toFixed(1)})`;

        // CSS variable name (kebab-case)
        const cssVarName = input.name.toLowerCase().replace(/\s+/g, "-");
        const css = `--color-${cssVarName}`;

        // Tailwind key (camelCase)
        const tailwind = input.name
          .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^\w/, (c) => c.toLowerCase());

        return {
          hex: input.hex.toUpperCase(),
          rgb,
          hsl,
          oklch,
          css,
          tailwind,
        };
      } catch (error) {
        throw new Error("Invalid color value");
      }
    }),
});
