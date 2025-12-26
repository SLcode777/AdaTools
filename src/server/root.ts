import { colorPaletteRouter } from "./routers/color-palette";
import { domainNamesRouter } from "./routers/domain-names";
import { moduleRouter } from "./routers/module";
import { removebgRouter } from "./routers/removebg";
import { testRouter } from "./routers/test";
import { translatorRouter } from "./routers/translator";
import { webpConverterRouter } from "./routers/webp-converter";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  test: testRouter,
  module: moduleRouter,
  removeBg: removebgRouter,
  translator: translatorRouter,
  webpConverter: webpConverterRouter,
  colorPalette: colorPaletteRouter,
  domainNames: domainNamesRouter,
});

export type AppRouterType = typeof appRouter;
