<script lang="ts">
   import { m } from "$i18n/messages";

   import { Card } from "@ota/ui/components/card/index.ts";

   import type { DashboardData } from "../../shared/types";
   import AvatarGroup from "../../shared/components/avatar-group.svelte";

   let { dashboard }: { dashboard: DashboardData } = $props();
</script>

<div class="grid gap-4">
   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-1">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_metric_players()}
         </p>
         <p class="text-3xl font-semibold tracking-[-0.05em]">
            {dashboard.metrics.playerCount}
         </p>
      </div>

      <AvatarGroup items={dashboard.metrics.playerPreview} kind="image" />
   </Card>

   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-1">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_metric_teams()}
         </p>
         <p class="text-3xl font-semibold tracking-[-0.05em]">
            {dashboard.metrics.teamCount}
         </p>
      </div>

      <AvatarGroup items={dashboard.metrics.teamPreview} kind="initials" />
   </Card>

   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-1">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_metric_staff()}
         </p>
         <p class="text-3xl font-semibold tracking-[-0.05em]">
            {dashboard.metrics.staffCount}
         </p>
      </div>

      <AvatarGroup items={dashboard.metrics.staffPreview} kind="image" />
   </Card>
</div>
