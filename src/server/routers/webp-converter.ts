import sharp from "sharp";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const webpConverterRouter = createTRPCRouter({
  // Convert image (PNG/JPG) to WebP format
  convertToWebp: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        quality: z.number().min(1).max(100).optional().default(80),
        lossless: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Remove base64 prefix if present (data:image/png;base64,...)
        const base64Data = input.imageBase64.replace(
          /^data:image\/[a-z]+;base64,/,
          ""
        );

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Convert to WebP using sharp
        const webpBuffer = await sharp(imageBuffer)
          .webp({
            quality: input.quality,
            lossless: input.lossless,
          })
          .toBuffer();

        // Convert buffer back to base64
        const webpBase64 = webpBuffer.toString("base64");

        return {
          base64: `data:image/webp;base64,${webpBase64}`,
          size: webpBuffer.length,
        };
      } catch (error) {
        console.error("WebP conversion error:", error);
        throw new Error("Failed to convert image to WebP");
      }
    }),
});

