<script lang="ts">
   import DashboardLazySection from "$lib/features/dashboard/components/dashboard-lazy-section.svelte";
   import { m } from "$i18n/messages";

   import type { PageProps } from "./$types";

   let { data }: PageProps = $props();
</script>

<DashboardLazySection
   loader={() =>
      import("$lib/features/dashboard/views/gfx/dashboard-gfx-page.svelte")}
   componentProps={{ dashboard: data.dashboard }}
   loadingLabel={m.common_loading()}
   skeletonClass="min-h-[48rem]"
/>
