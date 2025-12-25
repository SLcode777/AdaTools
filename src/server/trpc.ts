import { auth } from "@/src/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";

import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "../lib/db";

//Context : will be passed to all tRPC procedures
export const createTRPCContext = async (opts: { req: NextRequest }) => {
  // Try to get session from better-auth (uses cookies)
  // Wrapped in try-catch to handle missing BETTER_AUTH_SECRET during development
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: opts.req.headers,
    });
  } catch {
    // Auth not configured - continue without session
    console.warn("Auth session retrieval failed (auth may not be configured)");
  }

  return {
    db,
    session,
    userId: session?.user.id,
    headers: opts.req.headers,
  };
};

export type CreateContextType = Awaited<ReturnType<typeof createTRPCContext>>;

//tRPC initialization

const t = initTRPC.context<CreateContextType>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

//export tRPC helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

//Public Procedure
export const publicProcedure = t.procedure;

//Middleware for authentication

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      userId: ctx.userId,
      session: ctx.session,
    },
  });
});

//Protected Procedure
export const protectedProcedure = t.procedure.use(isAuthed);
