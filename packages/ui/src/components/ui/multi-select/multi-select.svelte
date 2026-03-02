<script lang="ts">
   import type { Component } from "svelte";
   import { ArrowDown01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   import { Badge } from "@ota/ui/components/ui/badge/index.js";
   import { cn } from "@ota/ui/utils.js";

   export type MultiSelectItem = {
      value: string;
      label: string;
      icon?: Component;
      secondaryLabel?: string;
      [key: string]: unknown;
   };

   type Props = {
      name?: string;
      value?: string[];
      items?: MultiSelectItem[];
      onchange?: (value: string[]) => void;
      placeholder?: string;
      noResultsMessage?: string;
   };

   let {
      name,
      value = $bindable([]),
      items = [],
      onchange,
      placeholder = "Search...",
      noResultsMessage = "No results found.",
   }: Props = $props();

   let searchValue = $state("");

   const filteredItems = $derived(
      searchValue === ""
         ? items
         : items.filter(
              (item) =>
                 item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
                 item.value.toLowerCase().includes(searchValue.toLowerCase()),
           ),
   );

   function removeItem(itemValue: string) {
      value = value.filter((v) => v !== itemValue);
      onchange?.(value);
   }
</script>

<ComboboxPrimitive.Root
   type="multiple"
   bind:value
   {name}
   onOpenChangeComplete={(o) => {
      if (!o) searchValue = "";
   }}
   onValueChange={(v) => onchange?.(v)}
>
   {#if value.length > 0}
      <div class="flex flex-wrap items-center gap-1 pb-1.5">
         {#each items.filter( (i) => value.includes(i.value), ) as item (item.value)}
            <button
               type="button"
               class="hover:cursor-pointer"
               onclick={(e) => {
                  e.stopPropagation();
                  removeItem(item.value);
               }}
               aria-label={`Remove ${item.label}`}
            >
               <Badge variant="secondary" class="rounded-sm">
                  {#if item.icon}
                     {@const Icon = item.icon}
                     <Icon size={14} />
                  {/if}
                  {item.secondaryLabel ?? item.label}
               </Badge>
            </button>
         {/each}
      </div>
   {/if}

   <div class="relative">
      <ComboboxPrimitive.Input
         oninput={(e) => (searchValue = e.currentTarget.value)}
         class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 pr-10 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
         {placeholder}
      />
      <ComboboxPrimitive.Trigger
         class="absolute end-3 top-1/2 size-4 -translate-y-1/2 touch-none"
      >
         <HugeiconsIcon
            icon={ArrowDown01Icon}
            class="text-muted-foreground size-4"
         />
      </ComboboxPrimitive.Trigger>
   </div>

   <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Content
         class={cn(
            "z-50 rounded-xl border outline-hidden select-none",
            "border-muted bg-popover shadow-popover",
            "max-h-[calc(var(--bits-combobox-content-available-height)-90%)]",
            "w-[var(--bits-combobox-anchor-width)]",
            "min-w-[var(--bits-combobox-anchor-width)]",
            "overflow-y-scroll",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:translate-y-1",
            "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:-translate-y-1",
         )}
         sideOffset={10}
      >
         <ComboboxPrimitive.Viewport class="max-h-64 overflow-y-scroll! p-2">
            {#each filteredItems as item (item.value)}
               <ComboboxPrimitive.Item
                  class="data-highlighted:bg-secondary flex h-10 w-full items-center rounded-md py-3 pr-1.5 pl-3 text-sm outline-hidden select-none"
                  value={item.value}
                  label={item.label}
               >
                  {#snippet children({ selected })}
                     {#if item.icon}
                        {@const Icon = item.icon}
                        <Icon size={20} />
                     {/if}
                     <span class={item.icon ? "ml-2" : ""}>{item.label}</span>
                     {#if item.secondaryLabel}
                        <span class="text-muted-foreground ml-auto text-xs">
                           {item.secondaryLabel}
                        </span>
                     {/if}
                     {#if selected}
                        <div class="ml-2">
                           <HugeiconsIcon icon={Tick01Icon} />
                        </div>
                     {/if}
                  {/snippet}
               </ComboboxPrimitive.Item>
            {:else}
               <span class="text-muted-foreground block px-5 py-2 text-sm">
                  {noResultsMessage}
               </span>
            {/each}
         </ComboboxPrimitive.Viewport>
      </ComboboxPrimitive.Content>
   </ComboboxPrimitive.Portal>
</ComboboxPrimitive.Root>
