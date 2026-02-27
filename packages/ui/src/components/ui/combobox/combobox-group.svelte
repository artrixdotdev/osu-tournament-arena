<script lang="ts">
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   import type { WithoutChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      class: className,
      children,
      ...restProps
   }: WithoutChild<ComboboxPrimitive.GroupProps> = $props();
</script>

<ComboboxPrimitive.Group
   bind:ref
   class={cn("overflow-hidden p-1", className)}
   {...restProps}
>
   {@render children?.()}
</ComboboxPrimitive.Group>
