import { type Config } from "@sveltejs/kit";

import svelteConfig from "@ota/svelte-config";

const config = {
   ...svelteConfig,

   kit: {
      ...svelteConfig.kit,
      alias: {
         "@repo/ui": "src",
         "@repo/ui/*": "src/*",
      },
   },
} satisfies Config;

export default config;
