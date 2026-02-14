<script lang="ts" module>
   import type { Snippet } from "svelte";
   import type { VariantProps } from "tailwind-variants";
   import { tv } from "tailwind-variants";

   import { cn } from "@ota/ui/utils.js";

   /**
    * Tailwind variants for the Stepper component.
    * Provides consistent styling for step indicators, labels, and separators.
    */
   export const stepperVariants = tv({
      slots: {
         root: "flex flex-col gap-4",
         stepList: "flex items-center gap-2",
         step: "flex items-center gap-2",
         stepIndicator:
            "flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
         stepLabel: "text-sm font-medium transition-colors",
         stepSeparator: "h-0.5 flex-1 bg-border transition-colors",
         content: "flex-1",
      },
      variants: {
         stepState: {
            active: {
               stepIndicator:
                  "border-primary bg-primary text-primary-foreground",
               stepLabel: "text-foreground",
            },
            completed: {
               stepIndicator:
                  "border-primary bg-primary text-primary-foreground",
               stepLabel: "text-foreground",
               stepSeparator: "bg-primary",
            },
            pending: {
               stepIndicator:
                  "border-muted-foreground/30 text-muted-foreground",
               stepLabel: "text-muted-foreground",
            },
         },
      },
   });

   export type StepperVariants = VariantProps<typeof stepperVariants>;

   /**
    * Configuration for a single step in the stepper.
    */
   export interface StepperStep {
      /** Unique identifier for the step */
      id: string;
      /** Display label for the step */
      label: string;
      /** If true, displays "(optional)" next to the label */
      optional?: boolean;
   }

   /**
    * Props for the Stepper component.
    *
    * @example
    * ```svelte
    * <Stepper
    *    steps={[
    *       { id: "step1", label: "First Step" },
    *       { id: "step2", label: "Second Step", optional: true },
    *       { id: "step3", label: "Final Step" },
    *    ]}
    *    currentStep="step2"
    *    completedSteps={["step1"]}
    * >
    *    <!-- Step content goes here -->
    * </Stepper>
    * ```
    */
   export interface StepperProps {
      /** Array of step configurations in order */
      steps: StepperStep[];
      /** ID of the currently active step */
      currentStep: string;
      /** Array of step IDs that have been completed */
      completedSteps?: string[];
      /** Additional CSS classes */
      class?: string;
      /** Content snippet to render inside the stepper */
      children: Snippet;
   }
</script>

<script lang="ts">
   let {
      steps,
      currentStep,
      completedSteps = [],
      class: className,
      children,
   }: StepperProps = $props();

   const {
      root,
      stepList,
      step,
      stepIndicator,
      stepLabel,
      stepSeparator,
      content,
   } = stepperVariants();

   /**
    * Determines the visual state of a step.
    * @param stepId - The step ID to check
    * @returns "completed" if in completedSteps, "active" if matches currentStep, otherwise "pending"
    */
   function getStepState(stepId: string): "active" | "completed" | "pending" {
      if (completedSteps.includes(stepId)) return "completed";
      if (stepId === currentStep) return "active";
      return "pending";
   }
</script>

<div class={cn(root(), className)}>
   <div class={stepList()}>
      {#each steps as stepItem, index (stepItem.id)}
         {@const state = getStepState(stepItem.id)}
         {@const isLast = index === steps.length - 1}
         <div class={step()}>
            <div
               class={cn(
                  stepIndicator(),
                  stepperVariants.variants.stepState[state]?.stepIndicator,
               )}
            >
               {#if state === "completed"}
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="16"
                     height="16"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="3"
                     stroke-linecap="round"
                     stroke-linejoin="round"
                  >
                     <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
               {:else}
                  {index + 1}
               {/if}
            </div>
            <span
               class={cn(
                  stepLabel(),
                  stepperVariants.variants.stepState[state]?.stepLabel,
               )}
            >
               {stepItem.label}
               {#if stepItem.optional}
                  <span class="text-muted-foreground text-xs">(optional)</span>
               {/if}
            </span>
         </div>
         {#if !isLast}
            <div
               class={cn(
                  stepSeparator(),
                  state === "completed" && "bg-primary",
               )}
            ></div>
         {/if}
      {/each}
   </div>
   <div class={content()}>
      {@render children()}
   </div>
</div>
