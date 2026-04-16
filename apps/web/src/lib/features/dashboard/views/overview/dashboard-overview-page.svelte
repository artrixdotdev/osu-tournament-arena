<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";
   import DashboardLazySection from "$lib/features/dashboard/components/dashboard-lazy-section.svelte";

   let { dashboard }: { dashboard: DashboardData } = $props();
</script>

<div class="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_20rem]">
   <div class="space-y-5">
      <DashboardLazySection
         loader={() =>
            import("$lib/features/dashboard/views/overview/overview-hero-panel.svelte")}
         componentProps={{ dashboard }}
         loadingLabel={m.common_loading()}
         skeletonClass="min-h-[22rem]"
      />

      <DashboardLazySection
         loader={() =>
            import("$lib/features/dashboard/views/overview/overview-secondary-cards.svelte")}
         componentProps={{ dashboard }}
         loadingLabel={m.common_loading()}
         skeletonClass="min-h-[14rem]"
      />
   </div>

   <DashboardLazySection
      loader={() =>
         import("$lib/features/dashboard/views/overview/overview-metric-rail.svelte")}
      componentProps={{ dashboard }}
      loadingLabel={m.common_loading()}
      skeletonClass="min-h-[34rem]"
   />
</div>
