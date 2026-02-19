<script lang="ts">
   import {
      PanelLeftCloseIcon,
      PanelLeftOpenIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   const sidebar = Sidebar.useSidebar();
</script>

<button
   type="button"
   class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ml-[1.5px] flex size-8 items-center justify-center rounded-md transition-colors"
   onclick={() => sidebar.toggle()}
>
   {#if sidebar.state === "expanded"}
      <HugeiconsIcon icon={PanelLeftCloseIcon} size={20} strokeWidth={1.5} />
   {:else}
      <HugeiconsIcon icon={PanelLeftOpenIcon} size={20} strokeWidth={1.5} />
   {/if}
</button>
