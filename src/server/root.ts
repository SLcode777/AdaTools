import { colorPaletteRouter } from "./routers/color-palette";
import { domainNamesRouter } from "./routers/domain-names";
import { moduleRouter } from "./routers/module";
import { removebgRouter } from "./routers/removebg";
import { snippetsRouter } from "./routers/snippets";
import { testRouter } from "./routers/test";
import { translatorRouter } from "./routers/translator";
import { webpConverterRouter } from "./routers/webp-converter";
import { youtubeVideosRouter } from "./routers/youtube-videos";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  test: testRouter,
  module: moduleRouter,
  removeBg: removebgRouter,
  translator: translatorRouter,
  webpConverter: webpConverterRouter,
  colorPalette: colorPaletteRouter,
  domainNames: domainNamesRouter,
  snippets: snippetsRouter,
  youtubeVideos: youtubeVideosRouter,
});

export type AppRouterType = typeof appRouter;
