import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";

import { db } from "@ota/db/client";
import * as schema from "@ota/db/schema";
import { authEnv } from "@ota/env";

const env = authEnv();
const OSU_PROVIDER_ID = "osu";
const DISCORD_PROVIDER_ID = "discord";
console.log(env.AUTH_DISCORD_SECRET);
export const auth = betterAuth({
   database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
         user: schema.user,
         account: schema.account,
         verification: schema.verification,
         session: schema.session,
      },
   }),
   session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
   },
   account: {
      accountLinking: {
         enabled: true,
         allowDifferentEmails: true,
         updateUserInfoOnLink: true,
      },
   },
   socialProviders: {
      discord: {
         clientId: env.AUTH_DISCORD_ID,
         clientSecret: env.AUTH_DISCORD_SECRET,
      },
   },
   databaseHooks: {
      user: {
         create: {
            /* eslint-disable @typescript-eslint/require-await  */
            before: async (userData) => {
               return {
                  data: {
                     ...userData,
                     osuId: null,
                     discordId: null,
                  },
               };
            },
         },
      },
      account: {
         create: {
            before: async (accountData) => {
               if (accountData.providerId === DISCORD_PROVIDER_ID) {
                  const existingOsuAccount = await db
                     .select()
                     .from(schema.account)
                     .where(
                        and(
                           eq(schema.account.userId, accountData.userId),
                           eq(schema.account.providerId, OSU_PROVIDER_ID),
                        ),
                     )
                     .limit(1);

                  if (existingOsuAccount.length === 0) {
                     throw new APIError("BAD_REQUEST", {
                        message:
                           "You must sign up with osu! before linking Discord.",
                     });
                  }
               }
            },
            after: async (accountData) => {
               const providerId = accountData.providerId;
               const accountId = accountData.accountId;

               if (providerId === OSU_PROVIDER_ID) {
                  await db
                     .update(schema.user)
                     .set({ osuId: accountId })
                     .where(eq(schema.user.id, accountData.userId));
               } else if (providerId === DISCORD_PROVIDER_ID) {
                  await db
                     .update(schema.user)
                     .set({ discordId: accountId })
                     .where(eq(schema.user.id, accountData.userId));
               }
            },
         },
      },
   },
   plugins: [
      genericOAuth({
         config: [
            {
               providerId: OSU_PROVIDER_ID,
               clientId: env.AUTH_OSU_CLIENT_ID,
               clientSecret: env.AUTH_OSU_CLIENT_SECRET,
               authorizationUrl: "https://osu.ppy.sh/oauth/authorize",
               tokenUrl: "https://osu.ppy.sh/oauth/token",
               userInfoUrl: "https://osu.ppy.sh/api/v2/me",
               scopes: ["identify"],
               getUserInfo: async (tokens) => {
                  const response = await fetch("https://osu.ppy.sh/api/v2/me", {
                     headers: {
                        Authorization: `Bearer ${tokens.accessToken}`,
                     },
                  });

                  if (!response.ok) {
                     return null;
                  }

                  interface Profile {
                     id: number;
                     username: string;
                     avatar_url: string;
                  }

                  const profile = (await response.json()) as Profile;

                  return {
                     id: profile.id.toString(),
                     email: `placeholder-${profile.id}@osu.local`,
                     name: profile.username,
                     image: profile.avatar_url,
                     emailVerified: false,
                  };
               },
            },
         ],
      }),
      nextCookies(),
   ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
