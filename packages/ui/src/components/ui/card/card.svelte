<script lang="ts" module>
   import type { VariantProps } from "tailwind-variants";
   import { tv } from "tailwind-variants";

   export const cardVariants = tv({
      base: "relative overflow-hidden border-0 text-card-foreground",
      variants: {
         variant: {
            default:
               "rounded-[2rem] bg-card shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]",
            secondary:
               "rounded-[2rem] bg-gradient-to-br from-card to-secondary/18 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]",
            accent:
               "rounded-[1.9rem] bg-gradient-to-br from-card to-accent/14 shadow-[0_22px_48px_rgb(0_0_0_/_0.16)]",
            chart2:
               "rounded-[2rem] bg-gradient-to-br from-card to-chart-2/12 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]",
            chart3:
               "rounded-[2rem] bg-gradient-to-br from-card to-chart-3/12 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]",
            chart5:
               "rounded-[2rem] bg-gradient-to-br from-card to-chart-5/12 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]",
            spotlight:
               "rounded-[2rem] bg-gradient-to-br from-card to-secondary/14 shadow-[0_26px_60px_rgb(0_0_0_/_0.18)]",
            inset: "rounded-[1.25rem] bg-muted px-4 py-3 shadow-none",
            metricSecondary:
               "rounded-[1.35rem] bg-secondary px-4 py-3 shadow-none",
            metricChart3:
               "rounded-[1.35rem] bg-chart-3/15 px-4 py-3 shadow-none",
         },
      },
      defaultVariants: {
         variant: "default",
      },
   });

   export type CardVariant = VariantProps<typeof cardVariants>["variant"];
</script>

<script lang="ts">
   import type { HTMLAttributes } from "svelte/elements";

   import type { WithElementRef } from "@ota/ui/utils.js";
   import { cn } from "@ota/ui/utils.js";

   let {
      ref = $bindable(null),
      as = "div",
      variant = "default",
      class: className,
      children,
      ...restProps
   }: WithElementRef<HTMLAttributes<HTMLElement>> & {
      as?: keyof HTMLElementTagNameMap;
      variant?: CardVariant;
   } = $props();
</script>

<svelte:element
   this={as}
   bind:this={ref}
   data-slot="card"
   class={cn(cardVariants({ variant }), className)}
   {...restProps}
>
   {@render children?.()}
</svelte:element>
