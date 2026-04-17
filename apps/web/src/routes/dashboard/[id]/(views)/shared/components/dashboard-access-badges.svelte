<script lang="ts">
   import { Badge } from "@ota/ui/components/badge/index.ts";
   import type { DashboardData } from "@ota/validators";

   import {
      getDashboardRoleLabel,
      getDashboardVisibilityLabel,
   } from "../labels";

   let {
      dashboard,
      roleBadgeClass = "",
   }: {
      dashboard: DashboardData;
      roleBadgeClass?: string;
   } = $props();

   const visibilityLabel = $derived(getDashboardVisibilityLabel(dashboard));
</script>

<div class="flex flex-wrap gap-2">
   <Badge variant="secondary">{visibilityLabel}</Badge>
   {#each dashboard.roles as role (role)}
      <Badge class={roleBadgeClass}>
         {getDashboardRoleLabel(role)}
      </Badge>
   {/each}
</div>
