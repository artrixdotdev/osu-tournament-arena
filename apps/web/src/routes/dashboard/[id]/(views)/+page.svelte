<script lang="ts">
   import { m } from "$i18n/messages";

   import type { PageProps } from "./$types";
   import DashboardLazySection from "./shared/components/dashboard-lazy-section.svelte";

   let { data }: PageProps = $props();
</script>

<div class="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_20rem]">
   <div class="space-y-5">
      <DashboardLazySection
         loader={() =>
            import("./overview/components/overview-hero-panel.svelte")}
         componentProps={{ dashboard: data.dashboard }}
         loadingLabel={m.common_loading()}
         skeletonClass="min-h-[11rem]"
      />

      <DashboardLazySection
         loader={() =>
            import("./overview/components/overview-secondary-cards.svelte")}
         componentProps={{ dashboard: data.dashboard }}
         loadingLabel={m.common_loading()}
         skeletonClass="min-h-[14rem]"
      />
   </div>

   <DashboardLazySection
      loader={() => import("./overview/components/overview-metric-rail.svelte")}
      componentProps={{ dashboard: data.dashboard }}
      loadingLabel={m.common_loading()}
      skeletonClass="min-h-[34rem]"
   />
</div>
