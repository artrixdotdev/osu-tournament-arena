<script lang="ts">
   import { m } from "$i18n/messages";
   import DashboardShell from "$lib/features/dashboard/components/dashboard-shell.svelte";

   import type { LayoutProps } from "./$types";

   let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
   <title>
      {m.tournamentDashboard_pageTitle({
         name: data.dashboard.tournament.name,
      })}
   </title>
</svelte:head>

<DashboardShell dashboard={data.dashboard}>
   {@render children()}
</DashboardShell>
