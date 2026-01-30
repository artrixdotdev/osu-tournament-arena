import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

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
      files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
      languageOptions: {
         parserOptions: {
            projectService: true,
            extraFileExtensions: [".svelte"],
            parser: tseslint.parser,
            svelteConfig,
         },
      },
   },
   {
      files: ["**/*.svelte"],
      rules: {
         "@typescript-eslint/no-unsafe-call": "off",
         "@typescript-eslint/no-unsafe-assignment": "off",
         "@typescript-eslint/no-unsafe-member-access": "off",
         "@typescript-eslint/no-unnecessary-condition": "off",
      },
   },
);
