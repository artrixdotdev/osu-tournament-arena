<script lang="ts">
   import { ChartIcon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import type { DashboardData } from "@ota/validators";
   import * as Avatar from "@ota/ui/components/avatar/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";
   import { getNameInitials } from "@ota/ui/utils.js";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const players = $derived(dashboard.metrics.playerPreview);
</script>

<div class="grid gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
   <Card as="article" class="p-6">
      <div class="flex h-full flex-col gap-5">
         <div class="flex items-end justify-between gap-4">
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
               >
                  Player list
               </p>
               <h2 class="text-2xl font-semibold tracking-[-0.05em]">
                  Active players
               </h2>
            </div>
            <p class="text-muted-foreground text-sm">
               {dashboard.metrics.playerCount.toLocaleString()} registered
            </p>
         </div>

         <div class="grid gap-3">
            {#each players as player, index (player.id)}
               <div
                  class="bg-muted flex items-center justify-between gap-4 rounded-[1.5rem] px-4 py-3"
               >
                  <div class="flex min-w-0 items-center gap-3">
                     <Avatar.Root
                        class="bg-secondary text-secondary-foreground size-11 rounded-2xl"
                     >
                        <Avatar.Image
                           src={player.image ?? undefined}
                           alt={player.name}
                        />
                        <Avatar.Fallback>
                           {getNameInitials(player.name)}
                        </Avatar.Fallback>
                     </Avatar.Root>

                     <div class="min-w-0">
                        <p class="truncate text-sm font-semibold">
                           {player.name}
                        </p>
                        <p class="text-muted-foreground text-xs">
                           Player slot {index + 1}
                        </p>
                     </div>
                  </div>

                  <div
                     class="bg-card text-muted-foreground rounded-xl px-3 py-2 text-xs font-medium"
                  >
                     Ready
                  </div>
               </div>
            {/each}
         </div>
      </div>
   </Card>

   <Card as="article" variant="chart2" class="p-6">
      <div class="flex h-full flex-col gap-5">
         <div class="flex items-end justify-between gap-4">
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
               >
                  Match activity
               </p>
               <h2 class="text-2xl font-semibold tracking-[-0.05em]">
                  Bracket momentum
               </h2>
            </div>

            <div
               class="bg-background text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-2xl"
            >
               <HugeiconsIcon icon={ChartIcon} size={20} strokeWidth={1.8} />
            </div>
         </div>

         <div
            class="bg-background grid min-h-[22rem] flex-1 gap-4 rounded-[1.75rem] p-5"
         >
            <div class="grid grid-cols-3 gap-3">
               <div class="bg-muted rounded-2xl px-4 py-3">
                  <p
                     class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                  >
                     Status
                  </p>
                  <p class="mt-2 text-base font-semibold">Placeholder</p>
               </div>
               <div class="bg-muted rounded-2xl px-4 py-3">
                  <p
                     class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                  >
                     Range
                  </p>
                  <p class="mt-2 text-base font-semibold">Coming later</p>
               </div>
               <div class="bg-muted rounded-2xl px-4 py-3">
                  <p
                     class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                  >
                     Source
                  </p>
                  <p class="mt-2 text-base font-semibold">Match data</p>
               </div>
            </div>

            <div
               class="bg-muted relative flex-1 overflow-hidden rounded-[1.5rem]"
            >
               <div class="grid h-full grid-rows-4">
                  <div class="border-border border-b"></div>
                  <div class="border-border border-b"></div>
                  <div class="border-border border-b"></div>
                  <div></div>
               </div>

               <svg
                  viewBox="0 0 100 40"
                  class="text-primary absolute inset-x-4 top-1/2 h-28 -translate-y-1/2"
                  aria-hidden="true"
               >
                  <path
                     d="M 0 28 C 10 26, 15 20, 24 19 S 40 24, 50 18 S 68 10, 76 14 S 90 22, 100 8"
                     fill="none"
                     stroke="currentColor"
                     stroke-linecap="round"
                     stroke-width="2.25"
                  />
               </svg>

               <div
                  class="absolute inset-x-5 bottom-5 flex items-center justify-between"
               >
                  <span class="text-muted-foreground text-xs">Round 1</span>
                  <span class="text-muted-foreground text-xs">Semis</span>
                  <span class="text-muted-foreground text-xs">Finals</span>
               </div>
            </div>
         </div>
      </div>
   </Card>
</div>
