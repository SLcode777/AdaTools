import { moduleRouter } from "./routers/module";
import { removebgRouter } from "./routers/removebg";
import { testRouter } from "./routers/test";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  test: testRouter,
  module: moduleRouter,
  removeBg: removebgRouter,
});

export type AppRouterType = typeof appRouter;
