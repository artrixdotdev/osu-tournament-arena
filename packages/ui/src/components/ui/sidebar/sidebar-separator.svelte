<script lang="ts">
   import type { ComponentProps } from "svelte";

   import { Separator } from "@ota/ui/components/ui/separator/index.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      class: className,
      ...restProps
   }: ComponentProps<typeof Separator> = $props();
</script>

<Separator
   bind:ref
   data-slot="sidebar-separator"
   data-sidebar="separator"
   class={cn("bg-sidebar-border", className)}
   {...restProps}
/>
