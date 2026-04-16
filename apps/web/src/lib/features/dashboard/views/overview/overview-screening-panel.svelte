<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";

   import { StaffRole } from "@ota/db/schema";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const canSeeEligibility = $derived(
      dashboard.roles.includes(StaffRole.POOLER) ||
         dashboard.roles.includes(StaffRole.PLAYTESTER) ||
         dashboard.roles.includes(StaffRole.ADMIN) ||
         dashboard.roles.includes(StaffRole.HOST),
   );
</script>

{#if canSeeEligibility}
   <article class="rounded-[1.9rem] border border-white/10 bg-white/[0.04] p-6">
      <div class="space-y-2">
         <p class="text-xs tracking-[0.16em] text-slate-300/70 uppercase">
            {m.tournamentDashboard_eligibility_title()}
         </p>
         <h2 class="text-2xl font-semibold tracking-[-0.05em] text-white">
            Screening guardrails
         </h2>
      </div>

      <dl class="mt-6 grid gap-3 md:grid-cols-3">
         <div class="rounded-[1.35rem] bg-white/[0.04] p-4">
            <dt class="text-xs tracking-[0.14em] text-slate-300/70 uppercase">
               {m.common_minimumRank()}
            </dt>
            <dd
               class="mt-3 text-xl font-semibold tracking-[-0.04em] text-white"
            >
               {dashboard.screeningRequirements?.minimumRank ??
                  m.tournamentDashboard_screeningAny()}
            </dd>
         </div>
         <div class="rounded-[1.35rem] bg-white/[0.04] p-4">
            <dt class="text-xs tracking-[0.14em] text-slate-300/70 uppercase">
               {m.common_maximumRank()}
            </dt>
            <dd
               class="mt-3 text-xl font-semibold tracking-[-0.04em] text-white"
            >
               {dashboard.screeningRequirements?.maximumRank ??
                  m.tournamentDashboard_screeningAny()}
            </dd>
         </div>
         <div class="rounded-[1.35rem] bg-white/[0.04] p-4">
            <dt class="text-xs tracking-[0.14em] text-slate-300/70 uppercase">
               {m.common_bws()}
            </dt>
            <dd
               class="mt-3 text-xl font-semibold tracking-[-0.04em] text-white"
            >
               {dashboard.screeningRequirements?.useBws
                  ? m.common_enabled()
                  : m.tournamentDashboard_screeningUnset()}
            </dd>
         </div>
      </dl>
   </article>
{/if}
