<script lang="ts">
   import favicon from "$lib/assets/favicon.svg";
   import AppSidebar from "$lib/components/app-sidebar.svelte";
   import SidebarHeader from "$lib/components/sidebar-header.svelte";
   import { ModeWatcher } from "mode-watcher";

   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   import "@ota/tailwind-config/theme";
   import "@ota/tailwind-config/fonts";

   let { children, data } = $props();
</script>

<svelte:head>
   <link rel="icon" href={favicon} />
</svelte:head>

<svelte:boundary>
   <ModeWatcher />

   <Sidebar.Provider class="bg-sidebar flex flex-col">
      <header
         class="bg-sidebar relative z-20 flex w-full items-center py-2 pr-4 pl-2"
      >
         <div class="flex items-center gap-2">
            <SidebarHeader />
            <span class="bg-muted-foreground/50 h-4 w-px shrink-0"></span>
            <a class="flex items-center gap-2" href="/">
               <div
                  class="bg-primary flex size-7 items-center justify-center rounded-md text-xs font-bold text-white"
               >
                  O
               </div>
               <span class="text-sm font-semibold tracking-wide">
                  osu! tournament arena
               </span>
            </a>
         </div>
      </header>
      <div class="flex flex-1 pr-2 pb-2">
         <AppSidebar user={data.user} />
         <main class="bg-background flex-1 rounded-xl">
            {@render children?.()}
         </main>
      </div>
   </Sidebar.Provider>
</svelte:boundary>
