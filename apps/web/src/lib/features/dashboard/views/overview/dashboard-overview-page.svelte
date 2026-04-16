<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";
   import DashboardLazySection from "$lib/features/dashboard/components/dashboard-lazy-section.svelte";

   let { dashboard }: { dashboard: DashboardData } = $props();
</script>

<div class="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,22rem)]">
   <div class="space-y-5">
      <DashboardLazySection
         loader={() =>
            import("$lib/features/dashboard/views/overview/overview-stat-grid.svelte")}
         componentProps={{ dashboard }}
         loadingLabel={m.common_loading()}
         skeletonClass="min-h-[10rem]"
         skeletonLines={2}
      />

      <DashboardLazySection
         loader={() =>
            import("$lib/features/dashboard/views/overview/overview-role-breakdown.svelte")}
         componentProps={{ dashboard }}
         loadingLabel="Loading staffing analytics..."
         skeletonClass="min-h-[28rem]"
      />

      <DashboardLazySection
         loader={() =>
            import("$lib/features/dashboard/views/overview/overview-screening-panel.svelte")}
         componentProps={{ dashboard }}
         loadingLabel="Loading screening rules..."
         skeletonClass="min-h-[14rem]"
      />
   </div>

   <DashboardLazySection
      loader={() =>
         import("$lib/features/dashboard/views/overview/overview-sidebar-rail.svelte")}
      componentProps={{ dashboard }}
      loadingLabel="Loading sidebar insights..."
      skeletonClass="min-h-[34rem]"
   />
</div>
