import { defineConfig } from "eslint/config";

import { baseConfig } from "@ota/eslint-config/base";
import { reactConfig } from "@ota/eslint-config/react";

export default defineConfig(
   {
      ignores: ["dist/**"],
   },
   baseConfig,
   reactConfig,
);
