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

   <Sidebar.Provider class="bg-sidebar flex h-screen flex-col overflow-hidden">
      <Topbar />
      <div class="flex min-h-0 flex-1 pr-2 pb-2">
         <AppSidebar user={data.user} />
         <main
            class="bg-background relative mt-14 flex-1 overflow-auto rounded-xl"
         >
            {@render children?.()}
         </main>
      </div>
   </Sidebar.Provider>
</svelte:boundary>
