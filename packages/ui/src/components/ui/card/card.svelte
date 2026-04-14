<script lang="ts" module>
   import type { VariantProps } from "tailwind-variants";
   import { tv } from "tailwind-variants";

   export const cardVariants = tv({
      base: "relative overflow-hidden border-0 text-card-foreground",
      variants: {
         variant: {
            default:
               "bg-card/94 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)] rounded-[2rem]",
            secondary:
               "bg-gradient-to-br from-card/95 to-secondary/14 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)] rounded-[2rem]",
            accent:
               "bg-gradient-to-br from-card/95 to-accent/10 shadow-[0_22px_48px_rgb(0_0_0_/_0.16)] rounded-[1.9rem]",
            chart2:
               "bg-gradient-to-br from-card/95 to-chart-2/8 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)] rounded-[2rem]",
            chart5:
               "bg-gradient-to-br from-card/95 to-chart-5/8 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)] rounded-[2rem]",
            spotlight:
               "bg-gradient-to-br from-card/96 to-secondary/10 shadow-[0_26px_60px_rgb(0_0_0_/_0.18)] rounded-[2rem]",
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
