import { defineConfig } from "eslint/config";

import svelteConfig from "@ota/eslint-config/svelte";

export default defineConfig(
   {
      ignores: [],
   },
   svelteConfig,
);
