<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";
   import {
      getDashboardVisibilityLabel,
      getRoleLabel,
   } from "$lib/features/dashboard/access";

   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const previewPath = $derived(`/tournament/${dashboard.tournament.id}`);
   const visibilityLabel = $derived(getDashboardVisibilityLabel(dashboard));
</script>

<div class="grid gap-4">
   <article class="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
      <p class="text-xs tracking-[0.14em] text-slate-300/70 uppercase">
         Publishing
      </p>
      <p class="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">
         {visibilityLabel}
      </p>
      <p class="mt-2 text-sm leading-6 text-slate-300/78">
         Open the public page to inspect the current tournament presentation
         from a player-facing perspective.
      </p>
      <div class="mt-4 space-y-2">
         <label
            class="text-xs tracking-[0.14em] text-slate-300/70 uppercase"
            for="dashboard-preview-link"
         >
            {m.tournamentDashboard_previewLink()}
         </label>
         <Input id="dashboard-preview-link" value={previewPath} readonly />
      </div>
   </article>

   <article class="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
      <p class="text-xs tracking-[0.14em] text-slate-300/70 uppercase">
         Active roles
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
         {#each dashboard.roles as role (role)}
            <Badge class="border-0 bg-white/8 text-slate-100 shadow-none">
               {getRoleLabel(role)}
            </Badge>
         {/each}
      </div>
   </article>

   <article class="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
      <p class="text-xs tracking-[0.14em] text-slate-300/70 uppercase">
         Coverage
      </p>
      <div class="mt-4 space-y-3">
         {#each dashboard.metrics.customizationCoverage as item (item.id)}
            <div class="space-y-2">
               <div
                  class="flex items-center justify-between gap-3 text-sm text-slate-200"
               >
                  <span>
                     {item.id === "body"
                        ? m.tournamentDashboard_coverage_body()
                        : item.id === "theme"
                          ? m.tournamentDashboard_coverage_theme()
                          : m.tournamentDashboard_coverage_font()}
                  </span>
                  <span class="text-slate-400"
                     >{item.value ? "Ready" : "Missing"}</span
                  >
               </div>
               <div class="h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                     class={`h-full rounded-full ${item.value ? "bg-emerald-400" : "bg-white/12"}`}
                     style={`width: ${item.value ? 100 : 28}%`}
                  ></div>
               </div>
            </div>
         {/each}
      </div>
   </article>
</div>
