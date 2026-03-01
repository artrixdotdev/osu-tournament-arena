<script lang="ts">
   import type { Component } from "svelte";
   import { m } from "$i18n/messages";
   import { countries } from "$lib/countries";
   import * as Flags from "svelte-flag-icons";

   import type { MultiSelectItem } from "@ota/ui/components/ui/multi-select/index.js";
   import { MultiSelect } from "@ota/ui/components/ui/multi-select/index.js";

   interface Props {
      value?: string[];
      onchange?: (value: string[]) => void;
      placeholder?: string;
      noResultsMessage?: string;
   }

   let {
      value = $bindable([]),
      onchange,
      placeholder = m.home_searchPlaceholder(),
      noResultsMessage = m.common_noResults(),
   }: Props = $props();

   function getFlagComponent(code: string): Component | undefined {
      const componentName =
         code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
      return (Flags as unknown as Record<string, Component>)[componentName];
   }

   const items: MultiSelectItem[] = $derived(
      countries.map((c) => {
         const FlagComponent = getFlagComponent(c.code);
         return {
            value: c.code,
            label: c.name,
            icon: FlagComponent,
            secondaryLabel: c.code,
         };
      }),
   );
</script>

<MultiSelect bind:value {items} {onchange} {placeholder} {noResultsMessage} />
