<script lang="ts">
   import type { ComponentProps } from "svelte";
   import { SidebarLeft01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import { Button } from "@ota/ui/components/ui/button/index.js";
   import { cn } from "@ota/ui/utils.js";

   import { useSidebar } from "./context.svelte.js";

   let {
      ref = $bindable(null),
      class: className,
      onclick,
      ...restProps
   }: ComponentProps<typeof Button> & {
      onclick?: (e: MouseEvent) => void;
   } = $props();

   const sidebar = useSidebar();
</script>

<Button
   data-sidebar="trigger"
   data-slot="sidebar-trigger"
   variant="ghost"
   size="icon"
   class={cn("size-7", className)}
   type="button"
   onclick={(e) => {
      onclick?.(e);
      sidebar.toggle();
   }}
   {...restProps}
>
   <HugeiconsIcon icon={SidebarLeft01Icon} />
   <span class="sr-only">Toggle Sidebar</span>
</Button>
