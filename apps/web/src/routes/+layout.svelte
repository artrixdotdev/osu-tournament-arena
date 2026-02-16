<script lang="ts">
   import favicon from "$lib/assets/favicon.svg";
   import AppSidebar from "$lib/components/app-sidebar.svelte";
   import { ModeWatcher } from "mode-watcher";

   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   import "@ota/tailwind-config/theme";

   let { children, data } = $props();
</script>

<svelte:head>
   <link rel="icon" href={favicon} />
</svelte:head>

<svelte:boundary>
   <ModeWatcher />

   <Sidebar.Provider>
      <AppSidebar user={data.user ?? undefined} />
      <Sidebar.Inset>
         <header
            class="border-border/40 flex h-12 items-center gap-3 border-b px-4"
         >
            <div
               class="bg-primary flex size-7 items-center justify-center rounded-md text-xs font-bold text-white"
            >
               O
            </div>
            <span class="text-sm font-semibold tracking-wide">
               osu! tournament arena
            </span>
         </header>
         <main class="w-full">
            {@render children?.()}
         </main>
      </Sidebar.Inset>
   </Sidebar.Provider>
</svelte:boundary>
