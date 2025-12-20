import * as deepl from "deepl-node";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { decrypt, encrypt } from "../utils/encryption";

export const translatorRouter = createTRPCRouter({
  //get user's API key
  getApiKey: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { deeplApiKey: true },
    });

    let decryptedApiKey = null;
    if (user?.deeplApiKey) {
      try {
        decryptedApiKey = decrypt(user.deeplApiKey);
      } catch (error) {
        console.error("Error decrypting API key:", error);
      }
    }

    return {
      hasApiKey: !!user?.deeplApiKey,
      apiKey: decryptedApiKey,
    };
  }),

  //save user's API key
  saveApiKey: protectedProcedure
    .input(z.object({ apiKey: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      //encrypt before saving
      const encryptedApiKey = encrypt(input.apiKey);

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { deeplApiKey: encryptedApiKey },
      });

      return { success: true };
    }),

  //translate
  translate: protectedProcedure
    .input(
      z.object({
        textToTranslate: z.string(),
        translateFrom: z.string(),
        translateTo: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //get user's api key
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { deeplApiKey: true },
      });

      const encryptedApiKey = user?.deeplApiKey;

      if (!encryptedApiKey) {
        throw new Error("Please configure your Deepl API key first");
      }

      //decrypt api key
      let apiKey: string;
      try {
        apiKey = decrypt(encryptedApiKey);
      } catch (error) {
        console.error("Error decrypting API key:", error);
        throw new Error(
          "Failed to decrypt API key. Please re-configure your API key."
        );
      }

      const deeplClient = new deepl.DeepLClient(apiKey);

      try {
        const translation = await deeplClient.translateText(
          input.textToTranslate,
          input.translateFrom && input.translateFrom.trim() !== ""
            ? (input.translateFrom as deepl.SourceLanguageCode)
            : null,
          input.translateTo as deepl.TargetLanguageCode
        );
        return { text: translation.text };
      } catch (error) {
        console.error("Deepl API error:", error);
        throw new Error("Failed to translate");
      }
    }),

  //get all supported source languages
  getSupportedSourceLanguages: protectedProcedure.query(async ({ ctx }) => {
    //get user's api key
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { deeplApiKey: true },
    });

    const encryptedApiKey = user?.deeplApiKey;

    if (!encryptedApiKey) {
      return [];
    }

    //decrypt api key
    let apiKey: string;
    try {
      apiKey = decrypt(encryptedApiKey);
    } catch (error) {
      console.error("Error decrypting API key:", error);
      return [];
    }

    const deeplClient = new deepl.Translator(apiKey);

    try {
      const languages = await deeplClient.getSourceLanguages();
      return languages.map((lang) => ({
        language: lang.code,
        name: lang.name,
      }));
    } catch (error) {
      console.error("Error fetching supported source languages:", error);
      return [];
    }
  }),

  //get all supported target languages
  getSupportedTargetLanguages: protectedProcedure.query(async ({ ctx }) => {
    //get user's api key
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { deeplApiKey: true },
    });

    const encryptedApiKey = user?.deeplApiKey;

    if (!encryptedApiKey) {
      return [];
    }

    //decrypt api key
    let apiKey: string;
    try {
      apiKey = decrypt(encryptedApiKey);
    } catch (error) {
      console.error("Error decrypting API key:", error);
      return [];
    }

    const deeplClient = new deepl.Translator(apiKey);

    try {
      const languages = await deeplClient.getTargetLanguages();
      return languages.map((lang) => ({
        language: lang.code,
        name: lang.name,
      }));
    } catch (error) {
      console.error("Error fetching supported target languages:", error);
      return [];
    }
  }),
});
