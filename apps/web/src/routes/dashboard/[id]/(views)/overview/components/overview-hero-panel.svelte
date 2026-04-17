<script lang="ts">
   import {
      AddTeamIcon,
      ChartLineData02Icon,
      ShieldUserIcon,
      User02Icon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import { Card } from "@ota/ui/components/card/index.ts";

   import type { DashboardData } from "../../shared/types";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const metricCards = $derived([
      {
         label: "Matches played",
         value: "—",
         detail: "Placeholder",
         icon: ChartLineData02Icon,
         variant: "spotlight" as const,
      },
      {
         label: "Total teams",
         value: dashboard.metrics.teamCount.toLocaleString(),
         detail: "Registered rosters",
         icon: AddTeamIcon,
         variant: "chart2" as const,
      },
      {
         label: "Registered players",
         value: dashboard.metrics.playerCount.toLocaleString(),
         detail: "Across all signups",
         icon: User02Icon,
         variant: "accent" as const,
      },
      {
         label: "Staff assigned",
         value: dashboard.metrics.staffCount.toLocaleString(),
         detail: "Operations and support",
         icon: ShieldUserIcon,
         variant: "chart3" as const,
      },
   ]);
</script>

<div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
   {#each metricCards as metric (metric.label)}
      <Card as="article" variant={metric.variant} class="min-h-32 p-5">
         <div class="flex h-full flex-col justify-between gap-5">
            <div class="flex items-start justify-between gap-4">
               <div class="space-y-2">
                  <p
                     class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
                  >
                     {metric.label}
                  </p>
                  <p
                     class="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl"
                  >
                     {metric.value}
                  </p>
               </div>

               <div
                  class="bg-background text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-2xl"
               >
                  <HugeiconsIcon
                     icon={metric.icon}
                     size={20}
                     strokeWidth={1.8}
                  />
               </div>
            </div>

            <p class="text-muted-foreground text-sm">
               {metric.detail}
            </p>
         </div>
      </Card>
   {/each}
</div>
