<script lang="ts">
   import { m } from "$i18n/messages";

   import { Button } from "@ota/ui/components/button/index.ts";

   import type { DashboardTabId } from "../access";

   let {
      tabs,
      activeTab,
   }: {
      tabs: {
         id: DashboardTabId;
         href: string;
      }[];
      activeTab: DashboardTabId;
   } = $props();

   function getTabLabel(tabId: DashboardTabId) {
      switch (tabId) {
         case "overview":
            return m.tournamentDashboard_metrics_title();
         case "gfx":
            return m.tournamentDashboard_tab_gfx();
         case "pooling":
            return m.tournamentDashboard_tab_pooling();
         case "settings":
            return m.tournamentDashboard_tab_settings();
      }
   }
</script>

<nav
   class="border-border bg-background rounded-[1rem] border p-1"
   aria-label={m.tournamentDashboard_tabs_ariaLabel()}
>
   <div class="flex flex-wrap gap-2">
      {#each tabs as tab (tab.id)}
         <Button
            href={tab.href}
            variant={tab.id === activeTab ? "secondary" : "ghost"}
            class={tab.id === activeTab
               ? "rounded-md shadow-none"
               : "text-muted-foreground rounded-md"}
            aria-current={tab.id === activeTab ? "page" : undefined}
         >
            {getTabLabel(tab.id)}
         </Button>
      {/each}
   </div>
</nav>
