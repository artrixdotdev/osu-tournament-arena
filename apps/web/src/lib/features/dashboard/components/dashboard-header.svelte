<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";
   import {
      getDashboardVisibilityLabel,
      getRoleLabel,
   } from "$lib/features/dashboard/access";

   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Button } from "@ota/ui/components/button/index.ts";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const visibilityLabel = $derived(getDashboardVisibilityLabel(dashboard));
   const previewPath = $derived(`/tournament/${dashboard.tournament.id}`);
   const tournamentMonogram = $derived.by(() => {
      const source = dashboard.tournament.acronym ?? dashboard.tournament.name;
      return source
         .split(/\s+/)
         .filter(Boolean)
         .slice(0, 2)
         .map((token) => token[0]?.toUpperCase() ?? "")
         .join("");
   });
</script>

<section
   class="grid gap-6 rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(13,18,31,0.94))] p-5 shadow-[0_32px_90px_rgb(0_0_0_/_0.26)] lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:p-7"
>
   <div class="flex gap-5">
      <div
         class="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-emerald-300/25 bg-gradient-to-br from-emerald-500/28 via-emerald-400/10 to-sky-400/18 text-center shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)]"
      >
         {#if dashboard.tournament.iconUrl}
            <img
               src={dashboard.tournament.iconUrl}
               alt={dashboard.tournament.name}
               class="h-full w-full object-cover"
            />
         {:else}
            <span
               class="text-2xl font-semibold tracking-[0.18em] text-emerald-100"
            >
               {tournamentMonogram}
            </span>
         {/if}
      </div>

      <div class="min-w-0 space-y-4">
         <div class="space-y-2">
            <p class="text-xs tracking-[0.28em] text-emerald-100/55 uppercase">
               {m.navigation_tournaments()}
            </p>
            <h1
               class="text-3xl font-semibold tracking-[-0.06em] text-white sm:text-5xl"
            >
               {dashboard.tournament.name}
            </h1>
            <p class="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
               Command surface for staffing, presentation, and tournament
               operations.
            </p>
         </div>

         <div class="flex flex-wrap gap-2">
            <Badge variant="secondary">{visibilityLabel}</Badge>
            {#each dashboard.roles as role (role)}
               <Badge class="border-0 bg-white/8 text-slate-100 shadow-none">
                  {getRoleLabel(role)}
               </Badge>
            {/each}
         </div>
      </div>
   </div>

   <div
      class="grid gap-4 rounded-[2rem] border border-white/8 bg-white/[0.04] p-4"
   >
      <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
         <div class="rounded-[1.4rem] bg-white/[0.04] p-4">
            <p class="text-xs tracking-[0.16em] text-slate-300/70 uppercase">
               Players
            </p>
            <p
               class="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white"
            >
               {dashboard.metrics.playerCount}
            </p>
         </div>

         <div class="rounded-[1.4rem] bg-white/[0.04] p-4">
            <p class="text-xs tracking-[0.16em] text-slate-300/70 uppercase">
               Teams
            </p>
            <p
               class="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white"
            >
               {dashboard.metrics.teamCount}
            </p>
         </div>

         <div class="rounded-[1.4rem] bg-white/[0.04] p-4">
            <p class="text-xs tracking-[0.16em] text-slate-300/70 uppercase">
               Staff
            </p>
            <p
               class="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white"
            >
               {dashboard.metrics.staffCount}
            </p>
         </div>
      </div>

      <Button
         href={previewPath}
         variant="secondary"
         class="h-11 rounded-full bg-white/10 text-white shadow-none hover:bg-white/16"
      >
         {m.tournamentDashboard_openPage()}
      </Button>
   </div>
</section>
