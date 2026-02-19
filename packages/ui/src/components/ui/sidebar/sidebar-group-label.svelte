<script lang="ts">
   import type { Snippet } from "svelte";
   import type { HTMLAttributes } from "svelte/elements";

   import type { WithElementRef } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      children,
      child,
      class: className,
      ...restProps
   }: WithElementRef<HTMLAttributes<HTMLElement>> & {
      child?: Snippet<[{ props: Record<string, unknown> }]>;
   } = $props();

   const mergedProps = $derived({
      class: cn(
         "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-all duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
         "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:my-2 group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0",
         className,
      ),
      "data-slot": "sidebar-group-label",
      "data-sidebar": "group-label",
      ...restProps,
   });
</script>

{#if child}
   {@render child({ props: mergedProps })}
{:else}
   <div bind:this={ref} {...mergedProps}>
      <span class="group-data-[collapsible=icon]:hidden"
         >{@render children?.()}</span
      >
      <div
         class="bg-sidebar-foreground/50 hidden h-px w-full group-data-[collapsible=icon]:block"
      ></div>
   </div>
{/if}
