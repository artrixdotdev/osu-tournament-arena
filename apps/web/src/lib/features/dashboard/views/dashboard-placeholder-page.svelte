<script lang="ts">
   import { Card } from "@ota/ui/components/card/index.ts";

   let {
      title,
      description,
      footnote,
   }: {
      title: string;
      description: string;
      footnote: string;
   } = $props();
</script>

<Card as="article" variant="secondary" class="p-8">
   <div class="max-w-3xl space-y-4">
      <p class="text-muted-foreground text-xs tracking-[0.16em] uppercase">
         Coming next
      </p>
      <h2 class="text-3xl font-semibold tracking-[-0.06em]">{title}</h2>
      <p class="text-muted-foreground text-base leading-7">{description}</p>
      <div
         class="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-5"
      >
         <p class="text-sm leading-6 text-slate-300">{footnote}</p>
      </div>
   </div>
</Card>
