<script lang="ts">
   import { Search01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { Command as CommandPrimitive } from "bits-ui";

   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      class: className,
      value = $bindable(""),
      ...restProps
   }: CommandPrimitive.InputProps = $props();
</script>

<div
   class="flex h-9 items-center gap-2 border-b ps-3 pe-8"
   data-slot="command-input-wrapper"
>
   <HugeiconsIcon icon={Search01Icon} class="size-4 shrink-0 opacity-50" />
   <CommandPrimitive.Input
      data-slot="command-input"
      class={cn(
         "placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:border-ring flex h-10 w-full rounded-md border border-transparent bg-transparent py-3 text-sm outline-hidden focus-visible:ring-[2px] disabled:cursor-not-allowed disabled:opacity-50",
         className,
      )}
      bind:ref
      {...restProps}
      bind:value
   />
</div>
