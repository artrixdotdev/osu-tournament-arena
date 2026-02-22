import { defineConfig } from "eslint/config";

import svelteConfig from "@ota/eslint-config/svelte";

export default defineConfig(
   {
      ignores: ["dist/**"],
   },
   svelteConfig,
   {
      rules: {
         "@typescript-eslint/consistent-type-definitions": "off",
         "@typescript-eslint/no-empty-function": "warn",
         "@typescript-eslint/no-unsafe-argument": "warn",
         "svelte/no-navigation-without-resolve": "off",
      },
   },
);
