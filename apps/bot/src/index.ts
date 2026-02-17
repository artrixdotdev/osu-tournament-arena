import { discordEnv } from "@ota/env";

import { factory } from "@/factory";
import * as handlers from "@/handlers";

export default factory
   .discord({
      discordEnv() {
         const env = discordEnv();
         return {
            APPLICATION_ID: env.AUTH_DISCORD_ID,
            PUBLIC_KEY: env.DISCORD_PUBLIC_KEY,
            TOKEN: env.DISCORD_TOKEN,
         };
      },
   })
   .loader(Object.values(handlers));
