<script lang="ts">
   import { Skeleton } from "@ota/ui/components/skeleton/index.ts";

   let {
      class: className = "",
      lines = 4,
   }: {
      class?: string;
      lines?: number;
   } = $props();
</script>

<div
   class={`rounded-[1.9rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)] ${className}`}
>
   <div class="space-y-3">
      <Skeleton class="h-4 w-28 rounded-full" />
      <Skeleton class="h-8 w-56 rounded-full" />
      {#each Array.from({ length: lines }) as _, index (index)}
         <Skeleton
            class={`h-3 rounded-full ${index === lines - 1 ? "w-5/12" : "w-full"}`}
         />
      {/each}
   </div>
</div>
