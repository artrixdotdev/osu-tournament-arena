<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";
   import {
      getDashboardRoleLabel,
      getDashboardVisibilityLabel,
   } from "$lib/features/dashboard/labels";

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

<section class="border-border bg-card rounded-[2rem] border p-5 lg:p-6">
   <div class="flex flex-wrap items-start justify-between gap-6">
      <div class="flex gap-5">
         <div
            class="bg-muted text-foreground border-border flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] border text-center"
         >
            {#if dashboard.tournament.iconUrl}
               <img
                  src={dashboard.tournament.iconUrl}
                  alt={dashboard.tournament.name}
                  class="h-full w-full object-cover"
               />
            {:else}
               <span class="text-2xl font-semibold tracking-[0.18em]">
                  {tournamentMonogram}
               </span>
            {/if}
         </div>

         <div class="min-w-0 space-y-4">
            <div class="space-y-2">
               <p class="text-muted-foreground text-xs tracking-[0.28em] uppercase">
                  {m.navigation_tournaments()}
               </p>
               <h1 class="text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">
                  {dashboard.tournament.name}
               </h1>
               <p class="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
                  {m.tournamentDashboard_description()}
               </p>
            </div>

            <div class="flex flex-wrap gap-2">
               <Badge variant="secondary">{visibilityLabel}</Badge>
               {#each dashboard.roles as role (role)}
                  <Badge class="border-0 shadow-none">
                     {getDashboardRoleLabel(role)}
                  </Badge>
               {/each}
            </div>
         </div>
      </div>

      <div class="flex items-center gap-3 self-center">
         <Button href={previewPath} variant="secondary">
            {m.tournamentDashboard_openPage()}
         </Button>
         {#if dashboard.permissions.canCustomizePage}
            <Button href={`/dashboard/${dashboard.tournament.id}/gfx`} variant="ghost">
               {m.tournamentDashboard_tab_gfx()}
            </Button>
         {/if}
      </div>
   </div>
</section>
