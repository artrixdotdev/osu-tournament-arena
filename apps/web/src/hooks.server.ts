import { building } from "$app/environment";
import { paraglideMiddleware } from "$i18n/server";
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

import { eq } from "@ota/db";
import { db } from "@ota/db/client";
import { user } from "@ota/db/schema";

import type { Handle, RequestEvent, ResolveOptions } from "@sveltejs/kit";

import "$lib/server/orpc";

export const handle: Handle = async ({ event, resolve }) => {
   return paraglideMiddleware(
      event.request,
      ({ request: localizedRequest, locale }) => {
         event.request = localizedRequest;

         const customResolve = async (
            evt: RequestEvent,
            opts?: ResolveOptions,
         ) => {
            const session = await auth.api.getSession({
               headers: evt.request.headers,
            });

            if (session) {
               evt.locals.session = session.session;
               evt.locals.user = session.user as typeof evt.locals.user;
            }

            if (session?.user) {
               const [userData] = await db
                  .select({ signupCompletedAt: user.signupCompletedAt })
                  .from(user)
                  .where(eq(user.id, session.user.id))
                  .limit(1);

               const signupCompletedAt = userData?.signupCompletedAt;
               evt.locals.user = {
                  ...session.user,
                  signupCompletedAt,
               } as typeof evt.locals.user;
            }

            return resolve(evt, {
               ...opts,
               transformPageChunk: ({ html }) => {
                  return html.replace("%lang%", locale);
               },
            });
         };

         return svelteKitHandler({
            event,
            resolve: customResolve,
            auth,
            building,
         });
      },
   );
};
