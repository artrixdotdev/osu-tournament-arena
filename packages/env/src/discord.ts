import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function discordEnv() {
   return createEnv({
      server: {
         DISCORD_TOKEN: z.string().min(1),
         DISCORD_SERVER_ID: z.string().min(1),
         DISCORD_PUBLIC_KEY: z.string().min(1),
         AUTH_DISCORD_ID: z.string().min(1),
      },
      runtimeEnv: process.env,
   });
}
