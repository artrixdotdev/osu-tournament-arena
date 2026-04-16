<script lang="ts">
   import { m } from "$i18n/messages";

   import { Card } from "@ota/ui/components/card/index.ts";
</script>

<Card as="article" class="space-y-5 p-6">
   <div class="space-y-2">
      <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
         {m.tournamentDashboard_metrics_title()}
      </p>
      <h2 class="text-2xl font-semibold tracking-[-0.05em]">
         {m.tournamentDashboard_overview_primaryTitle()}
      </h2>
      <p class="text-muted-foreground max-w-2xl text-sm leading-6">
         {m.tournamentDashboard_overview_primaryDescription()}
      </p>
   </div>

   <div
      class="border-border flex min-h-[24rem] items-center justify-center rounded-[1.5rem] border border-dashed"
   >
      <p class="text-muted-foreground text-sm">
         {m.tournamentDashboard_overview_placeholder()}
      </p>
   </div>
</Card>
