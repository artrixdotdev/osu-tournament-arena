import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function dbEnv() {
   return createEnv({
      server: {
         DATABASE_URL: z.url(),
         DATABASE_AUTH_TOKEN:
            process.env.NODE_ENV === "production"
               ? z.string().min(1)
               : z.string().min(1).optional(),
      },
      runtimeEnv: process.env,
   });
}
