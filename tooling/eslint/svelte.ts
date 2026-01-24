import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import globals from "globals";

import svelteConfig from "@ota/svelte-config";

import { baseConfig } from "./base";

export default defineConfig(baseConfig, {
   plugins: [...svelte.configs.recommended],
   languageOptions: {
      globals: {
         ...globals.browser,
         ...globals.node, // Add this if you are using SvelteKit in non-SPA mode
      },
   },
   {
       files: ['**/*.svelte', '**/*.svelte.js'],
       languageOptions: {
         parserOptions: {
           // We recommend importing and specifying svelte.config.js.
           // By doing so, some rules in eslint-plugin-svelte will automatically read the configuration and adjust their behavior accordingly.
           // While certain Svelte settings may be statically loaded from svelte.config.js even if you don’t specify it,
           // explicitly specifying it ensures better compatibility and functionality.
           //
           // If non-serializable properties are included, running ESLint with the --cache flag will fail.
           // In that case, please remove the non-serializable properties. (e.g. `svelteConfig: { ...svelteConfig, kit: { ...svelteConfig.kit, typescript: undefined }}`)
           svelteConfig
         }
       }
     },
});
