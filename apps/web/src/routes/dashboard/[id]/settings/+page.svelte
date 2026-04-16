<script lang="ts">
   import DashboardLazySection from "$lib/features/dashboard/components/dashboard-lazy-section.svelte";
</script>

<DashboardLazySection
   loader={() =>
      import("$lib/features/dashboard/views/dashboard-placeholder-page.svelte")}
   componentProps={{
      title: "Tournament settings",
      description:
         "Administrative configuration now has a dedicated host/admin-only route instead of sharing space with content customization.",
      footnote:
         "The page is intentionally isolated so future settings work can stay tightly scoped and permissioned.",
   }}
   loadingLabel="Loading settings workspace..."
   skeletonClass="min-h-[22rem]"
/>
