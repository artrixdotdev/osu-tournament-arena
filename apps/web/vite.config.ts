import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
   plugins: [
      sveltekit(),
      paraglideVitePlugin({
         project: "../../packages/i18n/project.inlang",
         outdir: "./src/lib/paraglide",
         strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
      }),
   ],
   ssr: {
      noExternal: [/^bits-ui/, /^svelte-toolbelt/, /^runed/, /^@ota\/ui/],
   },
});
