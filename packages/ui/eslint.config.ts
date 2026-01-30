import { defineConfig } from "eslint/config";

import svelteConfig from "@ota/eslint-config/svelte";

export default defineConfig(
   {
      ignores: ["dist/**"],
   },
   svelteConfig,
   {
      rules: {
         "svelte/no-navigation-without-resolve": "off",
      },
   },
);
