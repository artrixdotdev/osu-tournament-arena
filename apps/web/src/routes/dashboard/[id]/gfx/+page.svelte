<script lang="ts">
   import DashboardLazySection from "$lib/features/dashboard/components/dashboard-lazy-section.svelte";

   import type { PageProps } from "./$types";

   let { data }: PageProps = $props();
</script>

<DashboardLazySection
   loader={() =>
      import("$lib/features/dashboard/views/gfx/dashboard-gfx-page.svelte")}
   componentProps={{ dashboard: data.dashboard }}
   loadingLabel="Loading GFX workspace..."
   skeletonClass="min-h-[48rem]"
/>
