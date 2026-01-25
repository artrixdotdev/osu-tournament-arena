import { type Config } from "@sveltejs/kit";

import svelteConfig from "@ota/svelte-config";

const config = {
   ...svelteConfig,

   kit: {
      ...svelteConfig.kit,
   },
} satisfies Config;

export default config;
