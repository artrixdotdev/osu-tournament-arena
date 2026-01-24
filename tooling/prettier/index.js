/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
   tabWidth: 3,
   plugins: [
      "@ianvs/prettier-plugin-sort-imports",
      "prettier-plugin-svelte",
      "prettier-plugin-tailwindcss",
   ],
   tailwindFunctions: ["cn", "cva"],
   importOrder: [
      "<TYPES>",
      "^(svelte/(.*)$)|^(svelte$)",
      "^(\\\$app/(.*)$)|^(\\\$app$)",
      "<THIRD_PARTY_MODULES>",
      "",
      "<TYPES>^@ota",
      "^@ota/(.*)$",
      "",
      "<TYPES>^@",
      "^@/(.*)$",
      "",
      "<TYPES>^[.|..|~]",
      "^~/",
      "^[../]",
      "^[./]",
   ],
   importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
   importOrderTypeScriptVersion: "5.0.0",
   overrides: [
      {
         files: "*.json.hbs",
         options: {
            parser: "json",
         },
      },
      {
         files: "*.ts.hbs",
         options: {
            parser: "babel",
         },
      },
   ],
};

export default config;
