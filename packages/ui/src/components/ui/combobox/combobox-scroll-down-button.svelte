<script lang="ts">
   import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   import type { WithoutChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      class: className,
      ...restProps
   }: WithoutChild<ComboboxPrimitive.ScrollDownButtonProps> = $props();
</script>

<ComboboxPrimitive.ScrollDownButton
   class={cn("flex w-full items-center justify-center py-1", className)}
   {...restProps}
>
   <HugeiconsIcon icon={ArrowDown01Icon} class="size-3" />
</ComboboxPrimitive.ScrollDownButton>
