<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";
   import {
      getDashboardRoleLabel,
      getDashboardVisibilityLabel,
   } from "$lib/features/dashboard/labels";

   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Button } from "@ota/ui/components/button/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";

   let {
      dashboard,
      saving,
      onSave,
   }: {
      dashboard: DashboardData;
      saving: boolean;
      onSave: () => Promise<void>;
   } = $props();

   const previewPath = $derived(`/tournament/${dashboard.tournament.id}`);
   const visibilityLabel = $derived(getDashboardVisibilityLabel(dashboard));
</script>

<div class="grid gap-4">
   <Card as="article" variant="secondary" class="space-y-4 p-6">
      <div class="space-y-2">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_previewLink()}
         </p>
         <h2 class="text-lg font-semibold tracking-[-0.03em]">
            {m.tournamentDashboard_overview_publicPageTitle()}
         </h2>
      </div>

      <div class="flex flex-wrap gap-2">
         <Badge variant="secondary">{visibilityLabel}</Badge>
         {#each dashboard.roles as role (role)}
            <Badge
               class="bg-background/60 text-foreground border-0 shadow-none"
            >
               {getDashboardRoleLabel(role)}
            </Badge>
         {/each}
      </div>

      <Input value={previewPath} readonly />

      <Button href={previewPath} variant="secondary" class="w-full">
         {m.tournamentDashboard_openPage()}
      </Button>
   </Card>

   <Card as="article" variant="secondary" class="space-y-4 p-6">
      <div class="space-y-2">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_customizationCoverage_title()}
         </p>
         <h2 class="text-lg font-semibold tracking-[-0.03em]">
            {m.tournamentDashboard_overview_readinessTitle()}
         </h2>
      </div>

      <div class="space-y-3">
         {#each dashboard.metrics.customizationCoverage as item (item.id)}
            <div class="space-y-2">
               <div class="flex items-center justify-between gap-3 text-sm">
                  <span>
                     {item.id === "body"
                        ? m.tournamentDashboard_coverage_body()
                        : item.id === "theme"
                          ? m.tournamentDashboard_coverage_theme()
                          : m.tournamentDashboard_coverage_font()}
                  </span>
                  <span class="text-muted-foreground">
                     {item.value
                        ? m.tournamentDashboard_overview_ready()
                        : m.tournamentDashboard_overview_missing()}
                  </span>
               </div>
               <div class="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                     class="bg-primary h-full rounded-full"
                     style={`width: ${item.value ? 100 : 24}%`}
                  ></div>
               </div>
            </div>
         {/each}
      </div>
   </Card>

   <Button class="h-11 rounded-full" onclick={onSave} disabled={saving}>
      {saving
         ? m.tournamentDashboard_savingChanges()
         : m.tournamentDashboard_saveChanges()}
   </Button>
</div>
