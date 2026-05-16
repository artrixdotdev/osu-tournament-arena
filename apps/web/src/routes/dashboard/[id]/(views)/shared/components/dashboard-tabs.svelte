<script lang="ts">
   import { m } from "$i18n/messages";

   import type { DashboardTabId } from "@ota/validators";
   import * as Tabs from "@ota/ui/components/tabs/index.ts";
   import { cn } from "@ota/ui/utils.js";

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

<nav aria-label={m.tournamentDashboard_tabs_ariaLabel()}>
   <Tabs.Root value={activeTab} class="w-full">
      <Tabs.List
         class=" h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-2"
      >
         {#each tabs as tab (tab.id)}
            <Tabs.Trigger
               value={tab.id}
               class={cn(
                  "h-10 flex-none rounded-xl px-6",
                  tab.id !== activeTab
                     ? "text-muted-foreground hover:bg-muted"
                     : "bg-accent text-accent-foreground",
               )}
            >
               {#snippet child({ props })}
                  <a
                     {...props}
                     href={tab.href}
                     aria-current={tab.id === activeTab ? "page" : undefined}
                  >
                     {getTabLabel(tab.id)}
                  </a>
               {/snippet}
            </Tabs.Trigger>
         {/each}
      </Tabs.List>
   </Tabs.Root>
</nav>
