<script lang="ts">
   import favicon from "$lib/assets/favicon.svg";
   import AppSidebar from "$lib/components/sidebar.svelte";
   import Topbar from "$lib/components/topbar.svelte";
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
      <Topbar />
      <div class="flex flex-1 pr-2 pb-2">
         <AppSidebar user={data.user} />
         <main class="bg-background flex-1 rounded-xl">
            {@render children?.()}
         </main>
      </div>
   </Sidebar.Provider>
</svelte:boundary>
