import { register } from "discord-hono";

import { discordEnv } from "@ota/env";

import { factory } from "@/factory";
import * as handlers from "@/handlers";

const env = discordEnv();

const result = await register(
   factory.getCommands(Object.values(handlers)),
   env.AUTH_DISCORD_ID,
   env.DISCORD_TOKEN,
   env.DISCORD_SERVER_ID,
);

console.log("👍 published commands", result);
