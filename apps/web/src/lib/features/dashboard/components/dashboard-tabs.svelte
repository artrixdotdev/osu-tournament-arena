<script lang="ts">
   import type { DashboardTabId } from "$lib/features/dashboard/access";

   import { Button } from "@ota/ui/components/button/index.ts";

   let {
      tabs,
      activeTab,
   }: {
      tabs: {
         id: DashboardTabId;
         label: string;
         description: string;
         href: string;
      }[];
      activeTab: DashboardTabId;
   } = $props();
</script>

<nav
   class="rounded-[2rem] border border-white/8 bg-white/[0.035] p-2 shadow-[0_24px_60px_rgb(0_0_0_/_0.14)]"
   aria-label="Dashboard tabs"
>
   <div class="flex flex-wrap gap-2">
      {#each tabs as tab (tab.id)}
         <Button
            href={tab.href}
            variant={tab.id === activeTab ? "secondary" : "ghost"}
            class={tab.id === activeTab
               ? "rounded-full bg-sky-400/16 text-sky-100 shadow-none hover:bg-sky-400/24"
               : "rounded-full text-slate-300 hover:bg-white/8 hover:text-white"}
            aria-current={tab.id === activeTab ? "page" : undefined}
         >
            {tab.label}
         </Button>
      {/each}
   </div>
</nav>
