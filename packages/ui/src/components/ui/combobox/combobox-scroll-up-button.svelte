<script lang="ts">
   import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   import type { WithElementRef, WithoutChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      class: className,
      ...restProps
   }: WithElementRef<WithoutChild<ComboboxPrimitive.ScrollUpButtonProps>> =
      $props();
</script>

<ComboboxPrimitive.ScrollUpButton
   bind:ref
   class={cn("flex w-full items-center justify-center py-1", className)}
   {...restProps}
>
   <HugeiconsIcon icon={ArrowUp01Icon} class="size-3" />
</ComboboxPrimitive.ScrollUpButton>
