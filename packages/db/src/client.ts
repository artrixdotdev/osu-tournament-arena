import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql/web";

import { dbEnv } from "@ota/env";

import * as schema from "./schema";

const env = dbEnv();

const client = createClient({
   url: env.DATABASE_URL,
   authToken: env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle({
   client,
   schema,
   casing: "snake_case",
});
