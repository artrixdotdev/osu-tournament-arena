<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { getDashboardRoleLabel } from "$lib/features/dashboard/labels";
   import { m } from "$i18n/messages";

   import * as Avatar from "@ota/ui/components/avatar/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";

   let { dashboard }: { dashboard: DashboardData } = $props();

   function initials(name: string) {
      return name
         .split(/\s+/)
         .filter(Boolean)
         .slice(0, 2)
         .map((part) => part[0]?.toUpperCase() ?? "")
         .join("");
   }
</script>

<div class="grid gap-4">
   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-1">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_metric_players()}
         </p>
         <p class="text-3xl font-semibold tracking-[-0.05em]">
            {dashboard.metrics.playerCount}
         </p>
      </div>

      <div class="flex flex-wrap gap-2">
         {#each dashboard.metrics.playerPreview as player (player.id)}
            <Avatar.Root class="border-border size-10 border">
               <Avatar.Image src={player.image ?? undefined} alt={player.name} />
               <Avatar.Fallback>{initials(player.name)}</Avatar.Fallback>
            </Avatar.Root>
         {/each}
      </div>
   </Card>

   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-1">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_metric_teams()}
         </p>
         <p class="text-3xl font-semibold tracking-[-0.05em]">
            {dashboard.metrics.teamCount}
         </p>
      </div>

      <div class="flex flex-wrap gap-2">
         {#each dashboard.metrics.teamPreview as team (team.id)}
            <span
               class="bg-secondary text-secondary-foreground inline-flex rounded-full px-3 py-1 text-xs font-medium"
            >
               {team.name}
            </span>
         {/each}
      </div>
   </Card>

   <Card as="article" class="space-y-4 p-5">
      <div class="space-y-1">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_metric_staff()}
         </p>
         <p class="text-3xl font-semibold tracking-[-0.05em]">
            {dashboard.metrics.staffCount}
         </p>
      </div>

      <div class="space-y-3">
         {#each dashboard.metrics.staffPreview as member (member.id)}
            <div class="flex items-center gap-3">
               <Avatar.Root class="border-border size-10 border">
                  <Avatar.Image src={member.image ?? undefined} alt={member.name} />
                  <Avatar.Fallback>{initials(member.name)}</Avatar.Fallback>
               </Avatar.Root>
               <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{member.name}</p>
                  <p class="text-muted-foreground truncate text-xs">
                     {member.roles.map(getDashboardRoleLabel).join(", ")}
                  </p>
               </div>
            </div>
         {/each}
      </div>
   </Card>
</div>
