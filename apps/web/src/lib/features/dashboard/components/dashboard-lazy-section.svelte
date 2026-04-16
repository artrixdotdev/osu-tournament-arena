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
         class="rounded-[1.9rem] border border-rose-400/30 bg-rose-500/10 p-5"
      >
         <p class="text-sm font-medium text-rose-100">
            Failed to load section.
         </p>
         <p class="mt-2 text-sm text-rose-100/70">{error.message}</p>
      </div>
   {/await}

   {#snippet pending()}
      <div class="space-y-3">
         <DashboardPanelSkeleton class={skeletonClass} lines={skeletonLines} />
         <p class="text-muted-foreground text-sm">{loadingLabel}</p>
      </div>
   {/snippet}
</svelte:boundary>
