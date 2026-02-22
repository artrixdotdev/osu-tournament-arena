import adapter from "@sveltejs/adapter-cloudflare";
import { type Config } from "@sveltejs/kit";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
   // Consult https://svelte.dev/docs/kit/integrations
   // for more information about preprocessors
   preprocess: [vitePreprocess()],

   kit: {
      adapter: adapter(),
      experimental: {
         remoteFunctions: true,
      },
      alias: {
         $paraglide: "./src/lib/paraglide",
      },
   },

   compilerOptions: {
      experimental: {
         async: true,
      },
   },

   extensions: [".svelte", ".svx"],
} satisfies Config;
