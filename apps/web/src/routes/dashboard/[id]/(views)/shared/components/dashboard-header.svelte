<script lang="ts">
   import { m } from "$i18n/messages";

   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Button } from "@ota/ui/components/button/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";

   import type { DashboardData } from "../types";
   import {
      getDashboardRoleLabel,
      getDashboardVisibilityLabel,
   } from "../labels";

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

<section class="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_20rem]">
   <Card as="article" variant="spotlight" class="min-h-[18rem] p-6 lg:p-7">
      {#if dashboard.tournament.bannerUrl}
         <img
            src={dashboard.tournament.bannerUrl}
            alt={m.tournamentPage_bannerAlt({
               name: dashboard.tournament.name,
            })}
            class="absolute inset-0 h-full w-full object-cover"
         />
         <div
            class="from-background/0 via-background/70 to-background absolute inset-0 bg-gradient-to-t"
            aria-hidden="true"
         ></div>
      {:else}
         <div
            class="from-card via-secondary to-accent absolute inset-0 bg-gradient-to-r"
            aria-hidden="true"
         ></div>
      {/if}

      <div class="flex h-full flex-col justify-between gap-8">
         <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-3">
               <p
                  class="text-muted-foreground text-xs tracking-[0.28em] uppercase"
               >
                  {m.navigation_tournaments()}
               </p>
               <div class="space-y-3">
                  <h1
                     class="max-w-3xl text-3xl font-semibold tracking-[-0.06em] sm:text-5xl"
                  >
                     {dashboard.tournament.name}
                  </h1>
                  <p class="max-w-2xl text-sm leading-6 sm:text-base">
                     {m.tournamentDashboard_description()}
                  </p>
               </div>
            </div>

            <div class="bg-background rounded-[1.35rem] px-4 py-3 text-right">
               <p
                  class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
               >
                  Acronym
               </p>
               <p class="mt-2 text-xl font-semibold tracking-[0.18em]">
                  {dashboard.tournament.acronym ?? tournamentMonogram}
               </p>
            </div>
         </div>

         <div class="flex flex-wrap items-end justify-between gap-4">
            <div class="flex flex-wrap gap-2">
               <Badge variant="secondary">{visibilityLabel}</Badge>
               {#each dashboard.roles as role (role)}
                  <Badge class="border-0 shadow-none">
                     {getDashboardRoleLabel(role)}
                  </Badge>
               {/each}
            </div>

            <Button href={previewPath} variant="secondary" size="lg">
               {m.tournamentDashboard_openPage()}
            </Button>
         </div>
      </div>
   </Card>

   <Card as="article" variant="chart3" class="p-5">
      <div
         class="flex h-full flex-col items-center justify-between gap-5 text-center"
      >
         <div
            class="bg-background text-foreground flex size-36 items-center justify-center overflow-hidden rounded-full"
         >
            {#if dashboard.tournament.iconUrl}
               <img
                  src={dashboard.tournament.iconUrl}
                  alt={dashboard.tournament.name}
                  class="h-full w-full object-cover"
               />
            {:else}
               <span class="text-3xl font-semibold tracking-[0.2em]">
                  {tournamentMonogram}
               </span>
            {/if}
         </div>

         <div class="space-y-2">
            <p
               class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
            >
               Tournament profile
            </p>
            <h2 class="text-2xl font-semibold tracking-[-0.05em]">
               {dashboard.tournament.name}
            </h2>
            <p class="text-muted-foreground text-sm">
               {dashboard.metrics.teamCount.toLocaleString()} teams and{" "}
               {dashboard.metrics.playerCount.toLocaleString()} players
            </p>
         </div>

         <div class="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div class="bg-background rounded-[1.4rem] px-4 py-3">
               <p
                  class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
               >
                  Staff
               </p>
               <p class="mt-2 text-lg font-semibold">
                  {dashboard.metrics.staffCount.toLocaleString()}
               </p>
            </div>
            <div class="bg-background rounded-[1.4rem] px-4 py-3">
               <p
                  class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
               >
                  Page
               </p>
               <p class="mt-2 text-lg font-semibold">
                  {visibilityLabel}
               </p>
            </div>
         </div>
      </div>
   </Card>
</section>
