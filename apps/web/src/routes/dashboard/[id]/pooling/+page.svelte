<script lang="ts">
   import DashboardLazySection from "$lib/features/dashboard/components/dashboard-lazy-section.svelte";
</script>

<DashboardLazySection
   loader={() =>
      import("$lib/features/dashboard/views/dashboard-placeholder-page.svelte")}
   componentProps={{
      title: "Pooling workspace",
      description:
         "This page is reserved for map pool work, playtest coordination, and pool-specific checkpoints.",
      footnote:
         "The route, tab visibility, and permission boundary are now in place. The detailed tooling can be added without touching the dashboard shell.",
   }}
   loadingLabel="Loading pooling workspace..."
   skeletonClass="min-h-[22rem]"
/>
