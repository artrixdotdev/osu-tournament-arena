import type { Config } from "drizzle-kit";

import { dbEnv } from "@ota/env";

const env = dbEnv();

export default {
   schema: "./src/schema.ts",
   dialect: "turso",
   dbCredentials: {
      url: env.DATABASE_URL,
      authToken: env.DATABASE_AUTH_TOKEN,
   },
   casing: "snake_case",
} satisfies Config;
