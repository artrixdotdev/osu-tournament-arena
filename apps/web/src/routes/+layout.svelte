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

<ModeWatcher />

<Sidebar.Provider>
   <AppSidebar user={data.user ?? undefined} />
   <main class="w-full">
      <Sidebar.Trigger />
      {@render children?.()}
   </main>
</Sidebar.Provider>
