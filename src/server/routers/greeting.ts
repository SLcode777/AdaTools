import { createTRPCRouter, publicProcedure } from "../trpc";

export const testRouter = createTRPCRouter({
  //test trpc connexion
  greeting: publicProcedure.query(() => "hello tRPC v10"),
});
