<script lang="ts">
   import type { Snippet } from "svelte";
   import { MinusSignIcon, Tick01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

   import type { WithoutChildrenOrChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      checked = $bindable(false),
      indeterminate = $bindable(false),
      class: className,
      children: childrenProp,
      ...restProps
   }: WithoutChildrenOrChild<DropdownMenuPrimitive.CheckboxItemProps> & {
      children?: Snippet;
   } = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
   bind:ref
   bind:checked
   bind:indeterminate
   data-slot="dropdown-menu-checkbox-item"
   class={cn(
      "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className,
   )}
   {...restProps}
>
   {#snippet children({ checked, indeterminate })}
      <span
         class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center"
      >
         {#if indeterminate}
            <HugeiconsIcon icon={MinusSignIcon} size={16} />
         {:else}
            <HugeiconsIcon
               icon={Tick01Icon}
               size={16}
               class={cn(!checked && "text-transparent")}
            />
         {/if}
      </span>
      {@render childrenProp?.()}
   {/snippet}
</DropdownMenuPrimitive.CheckboxItem>
