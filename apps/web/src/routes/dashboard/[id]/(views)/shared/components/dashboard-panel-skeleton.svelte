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
   class={`border-border bg-card rounded-[1.9rem] border p-5 ${className}`}
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
