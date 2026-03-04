<script lang="ts">
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   import type { WithoutChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      class: className,
      placeholder = "Search...",
      oninput,
      ...restProps
   }: WithoutChild<ComboboxPrimitive.InputProps> = $props();

   function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
      if (oninput) {
         oninput(e);
      }
   }
</script>

<ComboboxPrimitive.Input
   bind:ref
   class={cn(
      "border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      className,
   )}
   {placeholder}
   oninput={handleInput}
   {...restProps}
/>
