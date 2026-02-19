<script lang="ts">
   import {
      PanelLeftCloseIcon,
      PanelLeftOpenIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import { Separator } from "@ota/ui/components/separator/index.ts";
   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   const sidebar = Sidebar.useSidebar();
</script>

<header
   class="bg-sidebar relative z-20 flex w-full items-center py-2 pr-4 pl-2"
>
   <div class="flex items-center gap-2">
      <button
         type="button"
         class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ml-[1.5px] flex size-8 items-center justify-center rounded-md transition-colors"
         onclick={() => sidebar.toggle()}
      >
         {#if sidebar.state === "expanded"}
            <HugeiconsIcon
               icon={PanelLeftCloseIcon}
               size={20}
               strokeWidth={1.5}
            />
         {:else}
            <HugeiconsIcon
               icon={PanelLeftOpenIcon}
               size={20}
               strokeWidth={1.5}
            />
         {/if}
      </button>
      <Separator orientation="vertical" class="mr-2 h-4" />
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
