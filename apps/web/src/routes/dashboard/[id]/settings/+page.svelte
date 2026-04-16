<script lang="ts">
   import DashboardLazySection from "$lib/features/dashboard/components/dashboard-lazy-section.svelte";
   import { m } from "$i18n/messages";
</script>

<DashboardLazySection
   loader={() =>
      import("$lib/features/dashboard/views/dashboard-placeholder-page.svelte")}
   componentProps={{
      title: m.tournamentDashboard_settings_title(),
      description: m.tournamentDashboard_settings_description(),
      footnote: m.tournamentDashboard_settings_footnote(),
   }}
   loadingLabel={m.common_loading()}
   skeletonClass="min-h-[22rem]"
/>
