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
   class="border-border bg-card rounded-[1.75rem] border p-2"
   aria-label={m.tournamentDashboard_tabs_ariaLabel()}
>
   <div class="flex flex-wrap gap-2">
      {#each tabs as tab (tab.id)}
         <Button
            href={tab.href}
            variant={tab.id === activeTab ? "secondary" : "ghost"}
            size="lg"
            class={tab.id === activeTab
               ? "rounded-xl"
               : "text-muted-foreground hover:bg-muted rounded-xl"}
            aria-current={tab.id === activeTab ? "page" : undefined}
         >
            {getTabLabel(tab.id)}
         </Button>
      {/each}
   </div>
</nav>
