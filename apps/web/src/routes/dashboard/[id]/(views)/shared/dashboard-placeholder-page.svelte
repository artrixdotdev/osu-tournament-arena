<script lang="ts">
   import { m } from "$i18n/messages";

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
   <div class="space-y-4">
      <p class="text-muted-foreground text-xs tracking-[0.16em] uppercase">
         {m.tournamentDashboard_placeholderEyebrow()}
      </p>
      <h2 class="text-3xl font-semibold tracking-[-0.06em]">{title}</h2>
      <p class="text-muted-foreground text-base leading-7">{description}</p>
      <div class="bg-muted rounded border border-dashed p-5">
         <p class="text-muted-foreground text-sm leading-6">{footnote}</p>
      </div>
   </div>
</Card>
