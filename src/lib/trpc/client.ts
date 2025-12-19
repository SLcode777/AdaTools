import { AppRouterType } from "@/src/server/root";
import { createTRPCReact } from "@trpc/react-query";

export const api = createTRPCReact<AppRouterType>();
