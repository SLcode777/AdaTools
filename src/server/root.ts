import { testRouter } from "./routers/greeting";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  test: testRouter,
});

export type AppRouterType = typeof appRouter;
