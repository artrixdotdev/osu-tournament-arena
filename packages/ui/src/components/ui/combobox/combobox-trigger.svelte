<script lang="ts">
   import { ArrowDown01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   import type { WithoutChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   type Item = { value: string; label: string };

   let {
      ref = $bindable(null),
      class: className,
      items = [],
      value = $bindable(),
      size = "default",
      placeholder = "Select items...",
      onRemove,
      ...restProps
   }: WithoutChild<ComboboxPrimitive.TriggerProps> & {
      items: Item[];
      value: string[];
      size?: "sm" | "default";
      placeholder?: string;
      onRemove?: (value: string) => void;
   } = $props();

   const selectedItems = $derived(
      items.filter((item) => value.includes(item.value)),
   );

   function handleRemove(e: MouseEvent, itemValue: string) {
      e.stopPropagation();
      if (onRemove) {
         onRemove(itemValue);
      } else {
         value = value.filter((v) => v !== itemValue);
      }
   }
</script>

<ComboboxPrimitive.Trigger
   bind:ref
   data-slot="combobox-trigger"
   data-size={size}
   class={cn(
      "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex min-h-[36px] w-full flex-wrap items-center justify-between gap-1 rounded-md border bg-transparent px-3 py-1.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8",
      className,
   )}
   {...restProps}
>
   {#if selectedItems.length > 0}
      <div class="flex flex-wrap items-center gap-1">
         {#each selectedItems as item (item.value)}
            <span
               class="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium"
            >
               {item.label}
               <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground focus:ring-ring rounded-md p-0.5 transition-colors focus:ring-1 focus:outline-none"
                  onclick={(e) => handleRemove(e, item.value)}
                  aria-label={`Remove ${item.label}`}
               >
                  <HugeiconsIcon icon={Cancel01Icon} class="size-3" />
               </button>
            </span>
         {/each}
      </div>
   {:else}
      <span class="text-muted-foreground">{placeholder}</span>
   {/if}
   <HugeiconsIcon icon={ArrowDown01Icon} class="size-4 shrink-0 opacity-50" />
</ComboboxPrimitive.Trigger>
