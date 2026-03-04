<script lang="ts">
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   import type { WithoutChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      class: className,
      ...restProps
   }: WithoutChild<ComboboxPrimitive.GroupHeadingProps> = $props();
</script>

<ComboboxPrimitive.GroupHeading
   class={cn("text-foreground px-2 py-1.5 text-sm font-semibold", className)}
   {...restProps}
/>
