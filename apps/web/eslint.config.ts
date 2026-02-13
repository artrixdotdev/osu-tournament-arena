import { defineConfig } from "eslint/config";

import { baseConfig } from "@ota/eslint-config/base";
import svelteConfig from "@ota/eslint-config/svelte";

export default defineConfig(
   {
      ignores: ["dist/**"],
   },
   baseConfig,
   svelteConfig,
   {
      rules: {
         "svelte/no-navigation-without-resolve": "off",
      },
   },
);
