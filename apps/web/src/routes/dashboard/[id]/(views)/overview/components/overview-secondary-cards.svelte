<script lang="ts">
   import { m } from "$i18n/messages";

   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";

   import { getDashboardRoleLabel, getDashboardVisibilityLabel } from "../../shared/labels";
   import type { DashboardData } from "../../shared/types";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const previewPath = $derived(`/tournament/${dashboard.tournament.id}`);
   const visibilityLabel = $derived(getDashboardVisibilityLabel(dashboard));
</script>

<div class="grid gap-4 md:grid-cols-3">
   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-2">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_previewLink()}
         </p>
         <p class="text-lg font-semibold tracking-[-0.04em]">
            {visibilityLabel}
         </p>
      </div>
      <Input value={previewPath} readonly />
   </Card>

   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-2">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_eligibility_title()}
         </p>
         <p class="text-lg font-semibold tracking-[-0.04em]">
            {dashboard.screeningRequirements?.minimumRank ??
               m.tournamentDashboard_screeningAny()} - {dashboard.screeningRequirements
               ?.maximumRank ?? m.tournamentDashboard_screeningAny()}
         </p>
      </div>
      <p class="text-muted-foreground text-sm leading-6">
         {dashboard.screeningRequirements?.useBws
            ? m.common_enabled()
            : m.tournamentDashboard_screeningUnset()}
      </p>
   </Card>

   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-2">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_roles_title()}
         </p>
         <div class="flex flex-wrap gap-2">
            {#each dashboard.roles as role (role)}
               <Badge variant="secondary">{getDashboardRoleLabel(role)}</Badge>
            {/each}
         </div>
      </div>
   </Card>
</div>
