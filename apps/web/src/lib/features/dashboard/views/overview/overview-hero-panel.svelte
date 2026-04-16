<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { getDashboardRoleLabel } from "$lib/features/dashboard/labels";
   import { m } from "$i18n/messages";

   import { Card } from "@ota/ui/components/card/index.ts";
   import { Progress } from "@ota/ui/components/progress/index.ts";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const filledCoverage = $derived(
      dashboard.metrics.customizationCoverage.filter((item) => item.value > 0)
         .length,
   );
   const coveragePercent = $derived(
      dashboard.metrics.customizationCoverage.length === 0
         ? 0
         : Math.round(
              (filledCoverage / dashboard.metrics.customizationCoverage.length) *
                 100,
           ),
   );

   function coverageLabel(id: string) {
      switch (id) {
         case "body":
            return m.tournamentDashboard_coverage_body();
         case "theme":
            return m.tournamentDashboard_coverage_theme();
         default:
            return m.tournamentDashboard_coverage_font();
      }
   }
</script>

<Card as="article" class="space-y-6 p-6">
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

   <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(14rem,0.8fr)]">
      <div class="bg-muted rounded-[1.5rem] p-5">
         <div class="space-y-3">
            {#each dashboard.metrics.staffRoleCounts as item (item.role)}
               <div class="space-y-2">
                  <div class="flex items-center justify-between gap-3 text-sm">
                     <span>{getDashboardRoleLabel(item.role)}</span>
                     <span class="text-muted-foreground">{item.total}</span>
                  </div>
                  <div class="bg-background rounded-full p-1">
                     <div
                        class="bg-primary h-2 rounded-full"
                        style={`width: ${Math.max(12, Math.min(100, item.total * 16))}%`}
                     ></div>
                  </div>
               </div>
            {/each}
         </div>
      </div>

      <div class="bg-secondary/35 rounded-[1.5rem] p-5">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_customizationCoverage_title()}
         </p>
         <p class="mt-3 text-4xl font-semibold tracking-[-0.06em]">
            {coveragePercent}%
         </p>
         <p class="text-muted-foreground mt-2 text-sm leading-6">
            {m.tournamentDashboard_overview_coverageDescription()}
         </p>
         <Progress class="mt-4" value={coveragePercent} />

         <div class="mt-4 space-y-2">
            {#each dashboard.metrics.customizationCoverage as item (item.id)}
               <div class="flex items-center justify-between gap-3 text-sm">
                  <span>{coverageLabel(item.id)}</span>
                  <span class="text-muted-foreground">
                     {item.value
                        ? m.tournamentDashboard_overview_ready()
                        : m.tournamentDashboard_overview_missing()}
                  </span>
               </div>
            {/each}
         </div>
      </div>
   </div>
</Card>
