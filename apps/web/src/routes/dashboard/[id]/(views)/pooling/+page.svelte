<script lang="ts">
   import { m } from "$i18n/messages";

   import DashboardLazySection from "../shared/components/dashboard-lazy-section.svelte";
</script>

<DashboardLazySection
   loader={() => import("../shared/dashboard-placeholder-page.svelte")}
   componentProps={{
      title: m.tournamentDashboard_pooling_title(),
      description: m.tournamentDashboard_pooling_description(),
      footnote: m.tournamentDashboard_pooling_footnote(),
   }}
   loadingLabel={m.common_loading()}
   skeletonClass="min-h-[22rem]"
/>
