<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import type { Snippet } from "svelte";
   import { page } from "$app/state";
   import {
      getDashboardTabFromPath,
      getVisibleDashboardTabs,
   } from "$lib/features/dashboard/access";

   import DashboardHeader from "./dashboard-header.svelte";
   import DashboardTabs from "./dashboard-tabs.svelte";

   let {
      dashboard,
      children,
   }: {
      dashboard: DashboardData;
      children: Snippet;
   } = $props();

   const visibleTabs = $derived(getVisibleDashboardTabs(dashboard));
   const activeTab = $derived(getDashboardTabFromPath(page.url.pathname));
</script>

<div
   class="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_28%),linear-gradient(180deg,rgb(6,10,18),rgb(10,14,23))]"
>
   <div
      class="mx-auto flex w-full max-w-[96rem] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
   >
      <DashboardHeader {dashboard} />
      <DashboardTabs tabs={visibleTabs} {activeTab} />
      <div class="pb-6">
         {@render children()}
      </div>
   </div>
</div>
