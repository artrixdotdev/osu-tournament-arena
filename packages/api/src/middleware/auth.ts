import { ORPCError, os } from "@orpc/server";

import { auth } from "@ota/auth";

import type { ORPCContext } from "../orpc";

export const authMiddleware = os
   .$context<ORPCContext>()
   .middleware(async ({ context, next }) => {
      const sessionData = await auth.api.getSession({
         headers: context.reqHeaders,
      });

      if (!sessionData?.session) {
         throw new ORPCError("UNAUTHORIZED");
      }

      // Adds session and user to the context
      return next({
         context: {
            session: sessionData.session,
            user: sessionData.user,
         },
      });
   });
