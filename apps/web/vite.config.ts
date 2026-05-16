/// <reference types="vitest/config" />

import type { PluginOption } from "vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vite";

export default defineConfig({
   optimizeDeps: {
      exclude: [
         "svelte-codemirror-editor",
         "codemirror",
         "@codemirror/lang-markdown",
      ],
   },
   plugins: [
      sveltekit(),
      svelteTesting(),
      paraglideVitePlugin({
         project: "../../packages/i18n/project.inlang",
         outdir: "./src/lib/paraglide",
         strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
         emitTsDeclarations: true,
      }) as PluginOption,
   ],
   ssr: {
      noExternal: [
         /^bits-ui/,
         /^svelte-toolbelt/,
         /^runed/,
         /^@ota\/ui/,
         "svelte-sonner",
         "svelte-codemirror-editor",
      ],
   },
   test: {
      environment: "jsdom",
      include: ["src/**/*.test.ts"],
   },
});
