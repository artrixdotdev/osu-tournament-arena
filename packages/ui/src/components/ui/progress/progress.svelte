<script lang="ts">
   import { Progress as ProgressPrimitive } from "bits-ui";

   import type { WithoutChildrenOrChild } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      class: className,
      max = 100,
      value,
      ...restProps
   }: WithoutChildrenOrChild<ProgressPrimitive.RootProps> = $props();

   const resolvedValue = $derived.by(() => {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : 0;
   });

   const safeMax = $derived.by(() => {
      const numericMax = Number(max);
      return Number.isFinite(numericMax) && numericMax > 0 ? numericMax : 1;
   });

   const percent = $derived.by(() => {
      const nextPercent = (resolvedValue / safeMax) * 100;
      return Math.min(100, Math.max(0, nextPercent));
   });
</script>

<ProgressPrimitive.Root
   bind:ref
   data-slot="progress"
   class={cn(
      "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
      className,
   )}
   {value}
   {max}
   {...restProps}
>
   <div
      data-slot="progress-indicator"
      class="bg-primary h-full w-full flex-1 transition-all"
      style="transform: translateX(-{100 - percent}%)"
   ></div>
</ProgressPrimitive.Root>
