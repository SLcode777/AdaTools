import { moduleRouter } from "./routers/module";
import { testRouter } from "./routers/test";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  test: testRouter,
  module: moduleRouter,
});

export type AppRouterType = typeof appRouter;
