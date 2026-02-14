import { building } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

import { eq } from "@ota/db";
import { db } from "@ota/db/client";
import { user } from "@ota/db/schema";

import type { Handle } from "@sveltejs/kit";

import "$lib/server/orpc";

export const handle: Handle = async ({ event, resolve }) => {
   const session = await auth.api.getSession({
      headers: event.request.headers,
   });

   if (session) {
      event.locals.session = session.session;
      event.locals.user = session.user as typeof event.locals.user;
   }

   const path = event.url.pathname;

   if (session?.user) {
      const [userData] = await db
         .select({ signupCompletedAt: user.signupCompletedAt })
         .from(user)
         .where(eq(user.id, session.user.id))
         .limit(1);

      const signupCompletedAt = userData?.signupCompletedAt;
      event.locals.user = {
         ...session.user,
         signupCompletedAt,
      } as typeof event.locals.user;

      if (!signupCompletedAt && path !== "/signup" && !path.includes("/api")) {
         redirect(302, "/signup");
      }
   }

   return svelteKitHandler({ event, resolve, auth, building });
};
