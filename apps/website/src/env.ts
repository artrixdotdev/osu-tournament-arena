import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

import { authEnv, dbEnv } from "@ota/env";

// Get base URL from Cloudflare Pages environment or fallback to localhost
function getBaseUrl() {
   if (typeof process !== "undefined" && process.env) {
      // Cloudflare Pages provides CF_PAGES_URL in production
      if (process.env.CF_PAGES_URL) {
         return process.env.CF_PAGES_URL;
      }
      // For preview deployments
      if (process.env.CF_PAGES_BRANCH) {
         return `https://${process.env.CF_PAGES_BRANCH}.pages.dev`;
      }
   }
   return "http://localhost:3000";
}

export const env = createEnv({
   extends: [authEnv(), dbEnv()],
   shared: {
      NODE_ENV: z
         .enum(["development", "production", "test"])
         .default("development"),
   },
   /**
    * Specify your server-side environment variables schema here.
    * This way you can ensure the app isn't built with invalid env vars.
    */
   server: {
      // Cloudflare Pages environment variables
      CF_PAGES_URL: z.string().url().optional(),
      CF_PAGES_BRANCH: z.string().optional(),
   },

   /**
    * Specify your client-side environment variables schema here.
    * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
    */
   client: {
      // NEXT_PUBLIC_CLIENTVAR: z.string(),
   },
   /**
    * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
    */
   experimental__runtimeEnv: {
      NODE_ENV: process.env.NODE_ENV,
      CF_PAGES_URL: process.env.CF_PAGES_URL,
      CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
      // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
   },
   skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});

// Export helper to get base URL
export const baseUrl = getBaseUrl();
