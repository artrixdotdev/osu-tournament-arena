<script lang="ts">
   import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { Select as SelectPrimitive } from "bits-ui";

   import type { WithoutChildrenOrChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      class: className,
      ...restProps
   }: WithoutChildrenOrChild<SelectPrimitive.ScrollUpButtonProps> = $props();
</script>

<SelectPrimitive.ScrollUpButton
   bind:ref
   data-slot="select-scroll-up-button"
   class={cn("flex cursor-default items-center justify-center py-1", className)}
   {...restProps}
>
   <HugeiconsIcon icon={ArrowUp01Icon} class="size-4" />
</SelectPrimitive.ScrollUpButton>
