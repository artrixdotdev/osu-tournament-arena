import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@ota/eslint-config/base";
import { nextjsConfig } from "@ota/eslint-config/nextjs";

import { reactConfig } from "../../tooling/eslint/svelte";

export default defineConfig(
   {
      ignores: [".next/**"],
   },
   baseConfig,
   reactConfig,
   nextjsConfig,
   restrictEnvAccess,
);
