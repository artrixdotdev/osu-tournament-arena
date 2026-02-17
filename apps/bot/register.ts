import { register } from "discord-hono";

import { discordEnv } from "@ota/env";

const env = discordEnv();

await register(
   [],
   env.AUTH_DISCORD_ID,
   env.DISCORD_TOKEN,
   env.DISCORD_SERVER_ID,
);
