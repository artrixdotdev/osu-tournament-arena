<script lang="ts">
   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";

   import type { DashboardData } from "../../shared/types";
   import {
      getDashboardRoleLabel,
      getDashboardVisibilityLabel,
   } from "../../shared/labels";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const visibilityLabel = $derived(getDashboardVisibilityLabel(dashboard));
   const teams = $derived(dashboard.metrics.teamPreview);
</script>

<div class="grid gap-4">
   <Card as="article" class="p-5">
      <div class="flex h-full flex-col gap-5">
         <div class="space-y-2">
            <p
               class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
            >
               Team directory
            </p>
            <div class="flex items-end justify-between gap-3">
               <h2 class="text-2xl font-semibold tracking-[-0.05em]">Teams</h2>
               <p class="text-muted-foreground text-sm">
                  {dashboard.metrics.teamCount.toLocaleString()} total
               </p>
            </div>
         </div>

         <div class="grid gap-3">
            {#each teams as team, index (team.id)}
               <div
                  class="bg-muted flex items-center gap-3 rounded-[1.4rem] px-4 py-3"
               >
                  <div
                     class="bg-card text-foreground flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold"
                  >
                     {String(index + 1).padStart(2, "0")}
                  </div>

                  <div class="min-w-0">
                     <p class="truncate text-sm font-semibold">
                        {team.name}
                     </p>
                     <p class="text-muted-foreground text-xs">
                        Tournament team
                     </p>
                  </div>
               </div>
            {/each}
         </div>

         <div class="border-border mt-auto rounded-[1.4rem] border p-4">
            <p
               class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
            >
               Tournament access
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
               <Badge variant="secondary">{visibilityLabel}</Badge>
               {#each dashboard.roles as role (role)}
                  <Badge>{getDashboardRoleLabel(role)}</Badge>
               {/each}
            </div>
         </div>
      </div>
   </Card>
</div>
