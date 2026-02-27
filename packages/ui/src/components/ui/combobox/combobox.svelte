<script lang="ts">
   import type { Snippet } from "svelte";
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   type Item = { value: string; label: string; disabled?: boolean };

   let {
      open = $bindable(false),
      value = $bindable(),
      items = [],
      type = "multiple",
      children,
      ...restProps
   }: {
      type?: "single" | "multiple";
      open?: boolean;
      value?: string[];
      items?: Item[];
      children?: Snippet;
   } = $props();
</script>

<ComboboxPrimitive.Root
   {type}
   {open}
   bind:value={value as never}
   {items}
   {...restProps as any}
>
   {@render children?.()}
</ComboboxPrimitive.Root>
