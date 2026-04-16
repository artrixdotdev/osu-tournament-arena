<script lang="ts">
   import type { Snippet } from "svelte";
   import { page } from "$app/state";
   import {
      getDashboardTabFromPath,
      getVisibleDashboardTabs,
   } from "../access";

   import type { DashboardData } from "../types";

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

<div class="min-h-full">
   <div class="flex w-full flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader {dashboard} />
      <DashboardTabs tabs={visibleTabs} {activeTab} />
      <div class="pb-6">
         {@render children()}
      </div>
   </div>
</div>
