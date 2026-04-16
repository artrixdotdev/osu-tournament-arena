<script lang="ts">
   import type { DashboardData } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";

   let { dashboard }: { dashboard: DashboardData } = $props();

   const items = $derived([
      {
         id: "players",
         label: m.tournamentDashboard_metric_players(),
         value: dashboard.metrics.playerCount,
         tone: "from-sky-500/22 to-sky-400/8",
      },
      {
         id: "teams",
         label: m.tournamentDashboard_metric_teams(),
         value: dashboard.metrics.teamCount,
         tone: "from-fuchsia-500/18 to-fuchsia-300/8",
      },
      {
         id: "staff",
         label: m.tournamentDashboard_metric_staff(),
         value: dashboard.metrics.staffCount,
         tone: "from-emerald-500/20 to-emerald-300/8",
      },
   ] as const);
</script>

<section class="grid gap-4 md:grid-cols-3">
   {#each items as item (item.id)}
      <article
         class={`rounded-[1.8rem] border border-white/8 bg-gradient-to-br ${item.tone} p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.16)]`}
      >
         <p class="text-xs tracking-[0.14em] text-slate-200/70 uppercase">
            {item.label}
         </p>
         <p class="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">
            {item.value}
         </p>
      </article>
   {/each}
</section>
