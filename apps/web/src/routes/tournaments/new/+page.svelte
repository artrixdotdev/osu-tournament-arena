<script lang="ts">
   import { m } from "$i18n/messages";

   import { Button } from "@ota/ui/components/button/index.ts";
   import { Stepper } from "@ota/ui/components/stepper/index.ts";

   const steps = [
      { id: "details", label: m.tournamentCreate_step_details() },
      { id: "rankAndScreening", label: m.tournamentCreate_step_rankAndScreening() },
      {
         id: "discord",
         label: m.tournamentCreate_step_discord(),
         optional: true,
      },
   ];

   let currentStepIndex = $state(0);

   const currentStep = $derived(steps[currentStepIndex]?.id ?? steps[0].id);
   const completedSteps = $derived(
      steps.slice(0, currentStepIndex).map((step) => step.id),
   );

   const isFirstStep = $derived(currentStepIndex === 0);
   const isLastStep = $derived(currentStepIndex === steps.length - 1);

   function handleBack() {
      if (!isFirstStep) {
         currentStepIndex -= 1;
      }
   }

   function handleNext() {
      if (!isLastStep) {
         currentStepIndex += 1;
      }
   }
</script>

<svelte:head>
   <title>{m.tournamentCreate_pageTitle()}</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl p-6">
   <div class="mb-6 space-y-2">
      <h1 class="text-2xl font-bold">{m.tournamentCreate_title()}</h1>
      <p class="text-muted-foreground">{m.tournamentCreate_description()}</p>
   </div>

   <Stepper steps={steps} currentStep={currentStep} completedSteps={completedSteps}>
      <div class="space-y-6 rounded-lg border p-6">
         {#if currentStep === "details"}
            <div class="space-y-2">
               <h2 class="text-xl font-semibold">
                  {m.tournamentCreate_details_title()}
               </h2>
               <p class="text-muted-foreground text-sm">
                  {m.tournamentCreate_details_description()}
               </p>
            </div>
         {:else if currentStep === "rankAndScreening"}
            <div class="space-y-2">
               <h2 class="text-xl font-semibold">
                  {m.tournamentCreate_rankAndScreening_title()}
               </h2>
               <p class="text-muted-foreground text-sm">
                  {m.tournamentCreate_rankAndScreening_description()}
               </p>
            </div>
         {:else}
            <div class="space-y-2">
               <h2 class="text-xl font-semibold">
                  {m.tournamentCreate_discord_title()}
               </h2>
               <p class="text-muted-foreground text-sm">
                  {m.tournamentCreate_discord_description()}
               </p>
            </div>
         {/if}

         <div class="flex items-center justify-between">
            <Button variant="outline" onclick={handleBack} disabled={isFirstStep}>
               {m.tournamentCreate_back()}
            </Button>

            <Button onclick={handleNext} disabled={isLastStep}>
               {m.tournamentCreate_next()}
            </Button>
         </div>
      </div>
   </Stepper>
</div>
