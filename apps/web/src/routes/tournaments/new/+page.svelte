<script lang="ts">
   import { goto } from "$app/navigation";
   import { m } from "$i18n/messages";
   import { client } from "$lib/orpc";
   import { toast } from "svelte-sonner";

   import { Stepper } from "@ota/ui/components/stepper/index.ts";
   import * as Tooltip from "@ota/ui/components/tooltip/index.ts";

   import DetailsStep from "./details-step.svelte";
   import DiscordStep from "./discord-step.svelte";
   import ScreeningStep from "./screening-step.svelte";

   const steps = [
      { id: "details", label: m.tournamentCreate_step_details() },
      {
         id: "rankAndScreening",
         label: m.tournamentCreate_step_rankAndScreening(),
      },
      {
         id: "discord",
         label: m.tournamentCreate_step_discord(),
         optional: true,
      },
   ];

   const DEFAULT_TEAM_SIZE = 8;
   const DEFAULT_LOBBY_SIZE = 16;

   let currentStepIndex = $state(0);
   let createdTournamentId = $state<string | null>(null);

   let detailsSubmitting = $state(false);
   let detailsError = $state<string | null>(null);
   let settingsSubmitting = $state(false);
   let settingsError = $state(false);

   const currentStep = $derived(steps[currentStepIndex]?.id ?? "details");
   const completedSteps = $derived(
      steps.slice(0, currentStepIndex).map((step) => step.id),
   );

   const isFirstStep = $derived(currentStepIndex === 0);

   function handleBack() {
      if (!isFirstStep) {
         currentStepIndex -= 1;
      }
   }

   async function handleDetailsSubmit(data: {
      id: string;
      name: string;
      acronym: string | null;
      rendition: number | null;
      description: string | null;
      startDate: string;
      endDate: string;
   }) {
      detailsSubmitting = true;

      try {
         await client.tournament.create({
            id: data.id,
            name: data.name,
            acronym: data.acronym,
            rendition: data.rendition,
            description: data.description,
            startDate: new Date(`${data.startDate}T00:00:00`),
            endDate: new Date(`${data.endDate}T00:00:00`),
            isPublic: false,
            isArchived: false,
            lobbySize: DEFAULT_LOBBY_SIZE,
            teamSize: DEFAULT_TEAM_SIZE,
         });

         createdTournamentId = data.id;
         currentStepIndex = 1;
         toast.success(m.tournamentCreate_success_created());
      } catch (error) {
         console.error("Failed to create tournament:", error);

         const err = error as { code?: string; message?: string };
         if (err.code === "CONFLICT") {
            detailsError = m.tournamentCreate_errors_idInUse();
            toast.error(m.tournamentCreate_errors_idInUse());
         } else {
            detailsError = m.tournamentCreate_errors_createFailed();
            toast.error(m.tournamentCreate_errors_createFailed());
         }
      } finally {
         detailsSubmitting = false;
      }
   }

   async function handleSettingsSubmit(data: {
      teamSize: number;
      minimumRank?: number;
      maximumRank?: number;
      minimumRating?: number;
      maximumRating?: number;
      allowedCountries: string[];
      useBws?: boolean;
      minimumBadges?: number;
      bwsExponent?: number;
   }) {
      if (!createdTournamentId) {
         settingsError = true;
         return;
      }

      settingsSubmitting = true;

      try {
         await client.tournament.updateSettings({
            id: createdTournamentId,
            teamSize: data.teamSize,
         });

         await client.tournament.updateScreeningRequirements({
            id: createdTournamentId,
            minimumRank: data.minimumRank,
            maximumRank: data.maximumRank,
            minimumRating: data.minimumRating,
            maximumRating: data.maximumRating,
            allowedCountries: data.allowedCountries.length
               ? data.allowedCountries
               : null,
            useBws: data.useBws,
            minimumBadges: data.minimumBadges,
            bwsExponent: data.bwsExponent,
         });

         currentStepIndex = 2;
         toast.success(m.tournamentCreate_success_settingsSaved());
      } catch (error) {
         console.error("Failed to save tournament settings:", error);
         settingsError = true;
         toast.error(m.tournamentCreate_errors_settingsFailed());
      } finally {
         settingsSubmitting = false;
      }
   }

   async function handleFinish() {
      if (!createdTournamentId) {
         await goto("/tournaments");
         return;
      }

      await goto(`/tournaments/${createdTournamentId}`);
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

   <Tooltip.Provider delayDuration={150}>
      <Stepper {steps} {currentStep} {completedSteps}>
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

               <DetailsStep
                  onSubmit={handleDetailsSubmit}
                  bind:submitting={detailsSubmitting}
                  bind:error={detailsError}
                  {isFirstStep}
                  onBack={handleBack}
               />
            {:else if currentStep === "rankAndScreening"}
               <ScreeningStep
                  onSubmit={handleSettingsSubmit}
                  submitting={settingsSubmitting}
                  error={settingsError}
                  onBack={handleBack}
               />
            {:else}
               <DiscordStep onFinish={handleFinish} onBack={handleBack} />
            {/if}
         </div>
      </Stepper>
   </Tooltip.Provider>
</div>
