import { createTRPCContext } from "@trpc/tanstack-react-query";
import { AppRouterType } from "../../server/root";
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouterType>();
