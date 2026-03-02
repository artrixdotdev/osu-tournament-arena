<script lang="ts">
   import type { Snippet } from "svelte";
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   type Item = { value: string; label: string; disabled?: boolean };

   let {
      open = $bindable(false),
      value = $bindable<ComboboxPrimitive.RootProps["value"]>(),
      items = [],
      type = "multiple",
      children,
      ...restProps
   }: ComboboxPrimitive.RootProps & {
      items?: Item[];
      children?: Snippet;
   } = $props();
</script>

<ComboboxPrimitive.Root {type} {open} bind:value {items} {...restProps}>
   {@render children?.()}
</ComboboxPrimitive.Root>
