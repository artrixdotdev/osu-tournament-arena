<script lang="ts">
   import type { Component } from "svelte";
   import { untrack } from "svelte";
   import { m } from "$i18n/messages";

   import type { DashboardThemeState } from "@ota/validators";

   import DashboardPanelSkeleton from "./dashboard-panel-skeleton.svelte";

   let {
      loader,
      componentProps = {},
      body = $bindable<string | undefined>(undefined),
      fontFamily = $bindable<string | undefined>(undefined),
      radius = $bindable<string | undefined>(undefined),
      themeMode = $bindable<"light" | "dark" | undefined>(undefined),
      lightTheme = $bindable<DashboardThemeState | undefined>(undefined),
      darkTheme = $bindable<DashboardThemeState | undefined>(undefined),
      loadingLabel = m.common_loading(),
      skeletonClass = "min-h-[14rem]",
      skeletonLines = 5,
   }: {
      loader: () => Promise<{ default: unknown }>;
      componentProps?: Record<string, unknown>;
      body?: string;
      fontFamily?: string;
      radius?: string;
      themeMode?: "light" | "dark";
      lightTheme?: DashboardThemeState;
      darkTheme?: DashboardThemeState;
      loadingLabel?: string;
      skeletonClass?: string;
      skeletonLines?: number;
   } = $props();

   const sectionPromise = untrack(() => loader());
</script>

<svelte:boundary>
   {#await sectionPromise then module}
      {@const Section = module.default as Component<object>}
      {#if body !== undefined}
         <Section {...componentProps} bind:body />
      {:else if
         fontFamily !== undefined ||
         radius !== undefined ||
         themeMode !== undefined ||
         lightTheme !== undefined ||
         darkTheme !== undefined}
         <Section
            {...componentProps}
            bind:fontFamily
            bind:radius
            bind:themeMode
            bind:lightTheme
            bind:darkTheme
         />
      {:else}
         <Section {...componentProps} />
      {/if}
   {:catch error}
      <div class="border-border bg-card rounded-[1.9rem] border p-5">
         <p class="text-sm font-medium">
            {m.tournamentDashboard_error_sectionLoadFailed()}
         </p>
         <p class="text-muted-foreground mt-2 text-sm">{error.message}</p>
      </div>
   {/await}

   {#snippet pending()}
      <div class="space-y-3">
         <DashboardPanelSkeleton class={skeletonClass} lines={skeletonLines} />
         <p class="text-muted-foreground text-sm">{loadingLabel}</p>
      </div>
   {/snippet}
</svelte:boundary>
