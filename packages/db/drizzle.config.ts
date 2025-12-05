import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
   throw new Error("Missing POSTGRES_URL");
}

if (!process.env.DATABASE_AUTH_TOKEN && process.env.NODE_ENV === "production") {
   throw new Error("Missing DATABASE_AUTH_TOKEN");
}

export default {
   schema: "./src/schema.ts",
   dialect: "turso",
   dbCredentials: {
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
   },
   casing: "snake_case",
} satisfies Config;
