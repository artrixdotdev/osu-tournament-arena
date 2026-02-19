<script lang="ts">
   import {
      SidebarLeftIcon,
      SidebarRightIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   const sidebar = Sidebar.useSidebar();
</script>

<button
   type="button"
   class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-8 items-center justify-center rounded-md transition-colors"
   onclick={() => sidebar.toggle()}
>
   {#if sidebar.state === "expanded"}
      <HugeiconsIcon icon={SidebarLeftIcon} size={16} strokeWidth={2} />
   {:else}
      <HugeiconsIcon icon={SidebarRightIcon} size={16} strokeWidth={2} />
   {/if}
</button>
