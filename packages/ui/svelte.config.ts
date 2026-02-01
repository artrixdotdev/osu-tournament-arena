import { type Config } from "@sveltejs/kit";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

import svelteConfig from "@ota/svelte-config";

const config = {
   ...svelteConfig,

   preprocess: vitePreprocess(),

   kit: {
      ...svelteConfig.kit,
      alias: {
         "@ota/ui": "src",
         "@ota/ui/*": "src/*",
      },
   },
} satisfies Config;

export default config;
