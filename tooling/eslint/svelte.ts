import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import globals from "globals";

import svelteConfig from "@ota/svelte-config";

import { baseConfig } from "./base";

export default defineConfig(
   baseConfig,
   ...svelte.configs.recommended,
   {
      languageOptions: {
         globals: {
            ...globals.browser,
            ...globals.node,
         },
      },
   },
   {
      files: ["**/*.svelte", "**/*.svelte.js"],
      languageOptions: {
         parserOptions: {
            svelteConfig,
         },
      },
   },
);
