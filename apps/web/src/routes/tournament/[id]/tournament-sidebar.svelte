<script lang="ts">
   import { m } from "$i18n/messages";

   import { Button } from "@ota/ui/components/button/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";

   import type { TournamentDetailItem } from "./tournament-page.types";

   interface Props {
      isPublic: boolean;
      scheduleItems: TournamentDetailItem[];
      formatItems: TournamentDetailItem[];
   }

   let { isPublic, scheduleItems, formatItems }: Props = $props();
</script>

<aside
   class="tournament-shell space-y-4 pt-2 min-[72rem]:sticky min-[72rem]:top-6 min-[72rem]:self-start"
>
   <Card as="article" variant="secondary" class="space-y-4 p-5">
      <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
         Join this tournament
      </p>
      <p class="text-muted-foreground text-sm leading-6">
         {#if isPublic}
            Player and staff signup flows will appear here once the organizers
            open them.
         {:else}
            This page is still private. Signup actions are staged here for when
            the tournament goes live.
         {/if}
      </p>
      <div class="grid gap-3">
         <Button class="w-full justify-center">Sign Up to Play</Button>
         <Button variant="outline" class="w-full justify-center">
            Sign Up for Staff
         </Button>
      </div>
      <p class="text-muted-foreground text-xs leading-5">
         Placeholder actions only. No signup flow is wired up yet.
      </p>
   </Card>

   <Card as="article" variant="chart2" class="space-y-4 p-5">
      <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
         {m.tournamentPage_section_schedule()}
      </p>
      <dl class="space-y-3">
         {#each scheduleItems as item (item.label)}
            <Card
               variant="inset"
               class="flex items-start justify-between gap-4"
            >
               <dt class="text-muted-foreground text-sm">
                  {item.label}
               </dt>
               <dd class="text-right font-semibold">
                  {item.value}
               </dd>
            </Card>
         {/each}
      </dl>
   </Card>

   <Card as="article" variant="chart5" class="space-y-4 p-5">
      <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
         {m.tournamentPage_section_format()}
      </p>
      <dl class="space-y-3">
         {#each formatItems as item (item.label)}
            <Card
               variant="inset"
               class="flex items-start justify-between gap-4"
            >
               <dt class="text-muted-foreground text-sm">
                  {item.label}
               </dt>
               <dd class="text-right font-semibold">
                  {item.value}
               </dd>
            </Card>
         {/each}
      </dl>
   </Card>
</aside>
