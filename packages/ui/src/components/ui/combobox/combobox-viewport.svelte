<script lang="ts">
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   import type { WithoutChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      class: className,
      children,
      ...restProps
   }: WithoutChild<ComboboxPrimitive.ViewportProps> = $props();
</script>

<ComboboxPrimitive.Viewport
   bind:ref
   class={cn(
      "h-[var(--bits-combobox-anchor-height)] w-full min-w-[var(--bits-combobox-anchor-width)] scroll-my-1",
      className,
   )}
   {...restProps}
>
   {@render children?.()}
</ComboboxPrimitive.Viewport>
