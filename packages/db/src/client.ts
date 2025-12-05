import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/web";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
   throw new Error("DATABASE_URL is not defined");
}

if (!process.env.DATABASE_AUTH_TOKEN && process.env.NODE_ENV === "production") {
   throw new Error("DATABASE_AUTH_TOKEN is not defined");
}

const client = createClient({
   url: process.env.DATABASE_URL!,
   authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle({
   client,
   schema,
   casing: "snake_case",
});
