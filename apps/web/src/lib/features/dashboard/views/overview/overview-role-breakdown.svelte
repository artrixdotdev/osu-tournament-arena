<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";
   import { getRoleLabel } from "$lib/features/dashboard/access";

   import { StaffRole } from "@ota/db/schema";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const roleChartTones = [
      "bg-sky-400",
      "bg-cyan-400",
      "bg-violet-400",
      "bg-fuchsia-400",
      "bg-emerald-400",
      "bg-amber-300",
   ] as const;

   const showOperationsCard = $derived(
      dashboard.roles.includes(StaffRole.COMMENTATOR) ||
         dashboard.roles.includes(StaffRole.REFEREE) ||
         dashboard.roles.includes(StaffRole.ADMIN) ||
         dashboard.roles.includes(StaffRole.HOST),
   );
</script>

<article
   class="rounded-[2rem] border border-sky-300/25 bg-[linear-gradient(135deg,rgba(16,72,117,0.95),rgba(18,49,85,0.92))] p-6 shadow-[0_28px_80px_rgb(0_0_0_/_0.22)]"
>
   <div class="space-y-2">
      <p class="text-xs tracking-[0.16em] text-sky-100/70 uppercase">
         {m.tournamentDashboard_roles_title()}
      </p>
      <h2 class="text-2xl font-semibold tracking-[-0.05em] text-white">
         Staff distribution
      </h2>
      <p class="max-w-2xl text-sm leading-6 text-sky-50/78">
         See where operational weight is landing across the tournament and spot
         role gaps before they become bottlenecks.
      </p>
   </div>

   <div class="mt-6 grid gap-3">
      {#each dashboard.metrics.staffRoleCounts as item, index (item.role)}
         <div class="rounded-[1.35rem] bg-black/12 p-4 backdrop-blur-[2px]">
            <div class="flex items-center justify-between gap-4">
               <span class="font-medium text-white"
                  >{getRoleLabel(item.role)}</span
               >
               <span class="text-sm text-sky-50/75">{item.total}</span>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
               <div
                  class={`${roleChartTones[index % roleChartTones.length]} h-full rounded-full`}
                  style={`width: ${Math.max(8, Math.min(100, item.total * 16))}%`}
               ></div>
            </div>
         </div>
      {/each}
   </div>

   {#if showOperationsCard}
      <div
         class="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4"
      >
         <p class="text-xs tracking-[0.14em] text-sky-100/70 uppercase">
            {m.tournamentDashboard_operations_title()}
         </p>
         <p class="mt-2 text-sm leading-6 text-slate-100/78">
            Commentary, refereeing, and host coverage are represented on this
            dashboard. This view is intended to support match-day staffing
            decisions.
         </p>
      </div>
   {/if}
</article>
