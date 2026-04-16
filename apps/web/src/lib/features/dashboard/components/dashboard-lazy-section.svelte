<script lang="ts">
   import type { Component } from "svelte";
   import { untrack } from "svelte";
   import { m } from "$i18n/messages";

   import DashboardPanelSkeleton from "./dashboard-panel-skeleton.svelte";

   let {
      loader,
      componentProps = {},
      loadingLabel = m.common_loading(),
      skeletonClass = "min-h-[14rem]",
      skeletonLines = 5,
   }: {
      loader: () => Promise<{ default: unknown }>;
      componentProps?: Record<string, unknown>;
      loadingLabel?: string;
      skeletonClass?: string;
      skeletonLines?: number;
   } = $props();

   const sectionPromise = untrack(() => loader());
</script>

<svelte:boundary>
   {#await sectionPromise then module}
      {@const Section = module.default as Component<object>}
      <Section {...componentProps} />
   {:catch error}
      <div
         class="border-border bg-card rounded-[1.9rem] border p-5"
      >
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
