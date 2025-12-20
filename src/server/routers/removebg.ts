import { removeBackgroundFromImageBase64 } from "remove.bg";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { encrypt, decrypt } from "../utils/encryption";

export const removebgRouter = createTRPCRouter({
  // Get account balance from remove.bg
  getAccountBalance: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { removeBgApiKey: true },
    });

    const encryptedApiKey = user?.removeBgApiKey;

    if (!encryptedApiKey) {
      return null;
    }

    // Decrypt the API key
    let apiKey: string;
    try {
      apiKey = decrypt(encryptedApiKey);
    } catch (error) {
      console.error("Error decrypting API key:", error);
      return null;
    }

    // Call remove.bg account API
    try {
      const response = await fetch("https://api.remove.bg/v1.0/account", {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (!response.ok) {
        console.error("Remove.bg account API error:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        total: data.data.attributes.credits.total,
        subscription: data.data.attributes.credits.subscription,
        payg: data.data.attributes.credits.payg,
        freeCalls: data.data.attributes.api.free_calls,
      };
    } catch (error) {
      console.error("Error fetching account balance:", error);
      return null;
    }
  }),

  //get user's API key
  getApiKey: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { removeBgApiKey: true },
    });

    let decryptedApiKey = null;
    if (user?.removeBgApiKey) {
      try {
        decryptedApiKey = decrypt(user.removeBgApiKey);
      } catch (error) {
        console.error("Error decrypting API key:", error);
      }
    }

    return {
      hasApiKey: !!user?.removeBgApiKey,
      apiKey: decryptedApiKey,
    };
  }),

  //save user's API key
  saveApiKey: protectedProcedure
    .input(z.object({ apiKey: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Encrypt the API key before saving
      const encryptedApiKey = encrypt(input.apiKey);

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { removeBgApiKey: encryptedApiKey },
      });

      return { success: true };
    }),

  // Remove background using user's API key
  removeBackground: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        size: z.enum([
          "preview",
          "small",
          "regular",
          "medium",
          "hd",
          "4k",
          "full",
        ]),
        type: z.enum(["auto", "person", "product", "car"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user's encrypted API key from database
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { removeBgApiKey: true },
      });

      const encryptedApiKey = user?.removeBgApiKey;

      if (!encryptedApiKey) {
        throw new Error("Please configure your Remove.bg API key first");
      }

      // Decrypt the API key
      let apiKey: string;
      try {
        apiKey = decrypt(encryptedApiKey);
      } catch (error) {
        console.error("Error decrypting API key:", error);
        throw new Error("Failed to decrypt API key. Please re-configure your API key.");
      }

      try {
        const result = await removeBackgroundFromImageBase64({
          base64img: input.imageBase64,
          apiKey,
          size: input.size,
          type: input.type,
          crop: true,
          format: "auto",
        });

        return {
          base64: result.base64img,
        };
      } catch (error) {
        console.error("Remove.bg API error:", error);
        throw new Error("Failed to remove background");
      }
    }),
});
