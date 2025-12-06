import "server-only";

import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { cache } from "react";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@ota/db/client";

import { baseUrl, env } from "~/env";

// Get production URL - use Cloudflare Pages URL or fallback
const productionUrl = env.CF_PAGES_URL ?? baseUrl;

export function initAuth<
   TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
   baseUrl: string;
   productionUrl: string;
   secret: string | undefined;

   discordClientId: string;
   discordClientSecret: string;
   extraPlugins?: TExtraPlugins;
}) {
   const config = {
      database: drizzleAdapter(db, {
         provider: "sqlite",
      }),
      baseURL: options.baseUrl,
      secret: options.secret,
      plugins: [
         oAuthProxy({
            productionURL: options.productionUrl,
         }),
         ...(options.extraPlugins ?? []),
      ],
      socialProviders: {
         discord: {
            clientId: options.discordClientId,
            clientSecret: options.discordClientSecret,
            redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
         },
      },
      onAPIError: {
         onError(error, ctx) {
            console.error("BETTER AUTH API ERROR", error, ctx);
         },
      },
   } satisfies BetterAuthOptions;

   return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];

export const auth = initAuth({
   baseUrl,
   productionUrl,
   secret: env.AUTH_SECRET,
   discordClientId: env.AUTH_DISCORD_ID,
   discordClientSecret: env.AUTH_DISCORD_SECRET,
   extraPlugins: [nextCookies()],
});

export const getSession = cache(async () =>
   auth.api.getSession({ headers: await headers() }),
);
