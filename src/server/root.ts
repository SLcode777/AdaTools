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
});

export type AppRouterType = typeof appRouter;
