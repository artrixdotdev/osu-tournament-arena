import { REST } from "@discordjs/rest";

import { discordEnv } from "@ota/env";

const env = discordEnv();

export const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
