<script lang="ts">
   import { goto } from "$app/navigation";
   import { m } from "$i18n/messages";
   import { client } from "$lib/orpc";

   import { Button } from "@ota/ui/components/button/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import { Label } from "@ota/ui/components/label/index.ts";
   import { Stepper } from "@ota/ui/components/stepper/index.ts";
   import { Textarea } from "@ota/ui/components/textarea/index.ts";

   type Toast = {
      id: number;
      message: string;
      variant: "success" | "error";
   };

   const steps = [
      { id: "details", label: m.tournamentCreate_step_details() },
      { id: "rankAndScreening", label: m.tournamentCreate_step_rankAndScreening() },
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
   let settingsError = $state<string | null>(null);

   let idLocked = $state(true);
   let id = $state("");
   let name = $state("");
   let acronym = $state("");
   let rendition = $state("");
   let description = $state("");
   let startDate = $state("");
   let endDate = $state("");
   let teamSize = $state("8");
   let minimumRank = $state("");
   let maximumRank = $state("");
   let minimumRating = $state("");
   let maximumRating = $state("");
   let allowedCountries = $state("");

   let toasts = $state<Toast[]>([]);

   const currentStep = $derived(steps[currentStepIndex]?.id ?? "details");
   const completedSteps = $derived(
      steps.slice(0, currentStepIndex).map((step) => step.id),
   );

   const isFirstStep = $derived(currentStepIndex === 0);

   $effect(() => {
      if (idLocked) {
         id = slugify(name);
      }
   });

   function slugify(value: string) {
      return value
         .toLowerCase()
         .trim()
         .replace(/[^a-z0-9\s-]/g, "")
         .replace(/\s+/g, "-")
         .replace(/-+/g, "-")
         .replace(/^-|-$/g, "");
   }

   function showToast(message: string, variant: Toast["variant"]) {
      const toastId = Date.now() + Math.random();
      toasts = [...toasts, { id: toastId, message, variant }];

      setTimeout(() => {
         toasts = toasts.filter((toast) => toast.id !== toastId);
      }, 3000);
   }

   function getToastClasses(variant: Toast["variant"]) {
      if (variant === "error") {
         return "border-destructive bg-destructive/10 text-destructive";
      }

      return "border-emerald-400 bg-emerald-50 text-emerald-700";
   }

   function handleBack() {
      if (!isFirstStep) {
         currentStepIndex -= 1;
      }
   }

   function parseOptionalInt(value: string) {
      if (!value.trim()) {
         return undefined;
      }

      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) {
         return undefined;
      }

      return parsed;
   }

   function toggleIdLock() {
      idLocked = !idLocked;
      if (idLocked) {
         id = slugify(name);
      }
   }

   async function handleDetailsSubmit() {
      detailsError = null;

      if (!name.trim()) {
         detailsError = m.tournamentCreate_errors_requiredName();
         return;
      }

      if (!id.trim()) {
         detailsError = m.tournamentCreate_errors_requiredId();
         return;
      }

      if (!startDate) {
         detailsError = m.tournamentCreate_errors_requiredStartDate();
         return;
      }

      if (!endDate) {
         detailsError = m.tournamentCreate_errors_requiredEndDate();
         return;
      }

      if (new Date(endDate) < new Date(startDate)) {
         detailsError = m.tournamentCreate_errors_invalidDateRange();
         return;
      }

      detailsSubmitting = true;

      try {
         await client.tournament.create({
            id,
            name,
            acronym: acronym.trim() ? acronym.trim() : null,
            rendition: rendition.trim() ? Number.parseInt(rendition, 10) : null,
            description: description.trim() ? description.trim() : null,
            startDate: new Date(`${startDate}T00:00:00`),
            endDate: new Date(`${endDate}T00:00:00`),
            isPublic: false,
            isArchived: false,
            lobbySize: DEFAULT_LOBBY_SIZE,
            teamSize: DEFAULT_TEAM_SIZE,
         });

         createdTournamentId = id;
         currentStepIndex = 1;
         showToast(m.tournamentCreate_success_created(), "success");
      } catch (error) {
         console.error("Failed to create tournament:", error);
         detailsError = m.tournamentCreate_errors_createFailed();
         showToast(m.tournamentCreate_errors_createFailed(), "error");
      } finally {
         detailsSubmitting = false;
      }
   }

   async function handleSettingsSubmit() {
      if (!createdTournamentId) {
         settingsError = m.tournamentCreate_errors_settingsFailed();
         return;
      }

      settingsError = null;

      const parsedTeamSize = parseOptionalInt(teamSize);
      const parsedMinimumRank = parseOptionalInt(minimumRank);
      const parsedMaximumRank = parseOptionalInt(maximumRank);
      const parsedMinimumRating = parseOptionalInt(minimumRating);
      const parsedMaximumRating = parseOptionalInt(maximumRating);
      const parsedAllowedCountries = allowedCountries
         .split(",")
         .map((country) => country.trim().toUpperCase())
         .filter(Boolean);

      if (parsedTeamSize === undefined || parsedTeamSize <= 0) {
         settingsError = m.tournamentCreate_errors_settingsFailed();
         return;
      }

      if (
         parsedMinimumRank !== undefined &&
         parsedMaximumRank !== undefined &&
         parsedMinimumRank > parsedMaximumRank
      ) {
         settingsError = m.tournamentCreate_errors_settingsFailed();
         return;
      }

      if (
         parsedMinimumRating !== undefined &&
         parsedMaximumRating !== undefined &&
         parsedMinimumRating > parsedMaximumRating
      ) {
         settingsError = m.tournamentCreate_errors_settingsFailed();
         return;
      }

      settingsSubmitting = true;

      try {
         await client.tournament.updateSettings({
            id: createdTournamentId,
            teamSize: parsedTeamSize,
         });

         await client.tournament.updateScreeningRequirements({
            id: createdTournamentId,
            minimumRank: parsedMinimumRank,
            maximumRank: parsedMaximumRank,
            minimumRating: parsedMinimumRating,
            maximumRating: parsedMaximumRating,
            allowedCountries: parsedAllowedCountries.length
               ? parsedAllowedCountries
               : null,
         });

         currentStepIndex = 2;
         showToast(m.tournamentCreate_success_settingsSaved(), "success");
      } catch (error) {
         console.error("Failed to save tournament settings:", error);
         settingsError = m.tournamentCreate_errors_settingsFailed();
         showToast(m.tournamentCreate_errors_settingsFailed(), "error");
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

<div class="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
   {#each toasts as toast (toast.id)}
      <div
         class={`rounded-md border px-4 py-3 text-sm shadow ${getToastClasses(toast.variant)}`}
      >
         {toast.message}
      </div>
   {/each}
</div>

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

            <form
               class="space-y-4"
               onsubmit={(event) => {
                  event.preventDefault();
                  void handleDetailsSubmit();
               }}
            >
               <div class="space-y-2">
                  <Label for="tournament-id">{m.tournamentCreate_fields_id()}</Label>
                  <div class="relative">
                     <Input
                        id="tournament-id"
                        value={id}
                        placeholder={m.tournamentCreate_placeholders_id()}
                        readonly={idLocked}
                        oninput={(event) => {
                           const target = event.currentTarget as HTMLInputElement;
                           id = target.value;
                        }}
                     />
                     <button
                        type="button"
                        class="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
                        onclick={toggleIdLock}
                        aria-label={
                           idLocked
                              ? m.tournamentCreate_actions_unlockId()
                              : m.tournamentCreate_actions_lockId()
                        }
                        title={
                           idLocked
                              ? m.tournamentCreate_actions_unlockId()
                              : m.tournamentCreate_actions_lockId()
                        }
                     >
                        {#if idLocked}
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              class="size-4"
                           >
                              <rect x="5" y="11" width="14" height="10" rx="2" />
                              <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                           </svg>
                        {:else}
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              class="size-4"
                           >
                              <rect x="5" y="11" width="14" height="10" rx="2" />
                              <path d="M16 11V8a4 4 0 0 0-8 0" />
                           </svg>
                        {/if}
                     </button>
                  </div>
                  <p class="text-muted-foreground text-xs">
                     {#if idLocked}
                        {m.tournamentCreate_hints_idLocked()}
                     {:else}
                        {m.tournamentCreate_hints_idUnlocked()}
                     {/if}
                  </p>
               </div>

               <div class="space-y-2">
                  <Label for="tournament-name">
                     {m.tournamentCreate_fields_name()}
                  </Label>
                  <Input
                     id="tournament-name"
                     value={name}
                     placeholder={m.tournamentCreate_placeholders_name()}
                     oninput={(event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        name = target.value;
                     }}
                  />
               </div>

               <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                     <Label for="tournament-acronym">
                        {m.tournamentCreate_fields_acronym()}
                     </Label>
                     <Input
                        id="tournament-acronym"
                        value={acronym}
                        maxlength={4}
                        placeholder={m.tournamentCreate_placeholders_acronym()}
                        oninput={(event) => {
                           const target = event.currentTarget as HTMLInputElement;
                           acronym = target.value;
                        }}
                     />
                  </div>

                  <div class="space-y-2">
                     <Label for="tournament-rendition">
                        {m.tournamentCreate_fields_rendition()}
                     </Label>
                     <Input
                        id="tournament-rendition"
                        type="number"
                        min={1}
                        value={rendition}
                        placeholder={m.tournamentCreate_placeholders_rendition()}
                        oninput={(event) => {
                           const target = event.currentTarget as HTMLInputElement;
                           rendition = target.value;
                        }}
                     />
                  </div>
               </div>

               <div class="space-y-2">
                  <Label for="tournament-description">
                     {m.tournamentCreate_fields_description()}
                  </Label>
                  <Textarea
                     id="tournament-description"
                     value={description}
                     placeholder={m.tournamentCreate_placeholders_description()}
                     oninput={(event) => {
                        const target = event.currentTarget as HTMLTextAreaElement;
                        description = target.value;
                     }}
                  />
               </div>

               <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                     <Label for="tournament-start-date">
                        {m.tournamentCreate_fields_startDate()}
                     </Label>
                     <Input
                        id="tournament-start-date"
                        type="date"
                        value={startDate}
                        oninput={(event) => {
                           const target = event.currentTarget as HTMLInputElement;
                           startDate = target.value;
                        }}
                     />
                  </div>

                  <div class="space-y-2">
                     <Label for="tournament-end-date">
                        {m.tournamentCreate_fields_endDate()}
                     </Label>
                     <Input
                        id="tournament-end-date"
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        oninput={(event) => {
                           const target = event.currentTarget as HTMLInputElement;
                           endDate = target.value;
                        }}
                     />
                  </div>
               </div>

               {#if detailsError}
                  <p class="text-destructive text-sm">{detailsError}</p>
               {/if}

               <div class="flex items-center justify-between">
                  <Button variant="outline" onclick={handleBack} disabled={isFirstStep}>
                     {m.tournamentCreate_back()}
                  </Button>

                  <Button type="submit" disabled={detailsSubmitting}>
                     {#if detailsSubmitting}
                        {m.tournamentCreate_loading()}
                     {:else}
                        {m.tournamentCreate_next()}
                     {/if}
                  </Button>
               </div>
            </form>
         {:else if currentStep === "rankAndScreening"}
            <div class="space-y-2">
               <h2 class="text-xl font-semibold">
                  {m.tournamentCreate_rankAndScreening_title()}
               </h2>
               <p class="text-muted-foreground text-sm">
                  {m.tournamentCreate_rankAndScreening_description()}
               </p>
            </div>

            <form
               class="space-y-4"
               onsubmit={(event) => {
                  event.preventDefault();
                  void handleSettingsSubmit();
               }}
            >
               <div class="space-y-2">
                  <Label for="tournament-team-size">
                     {m.tournamentCreate_fields_teamSize()}
                  </Label>
                  <Input
                     id="tournament-team-size"
                     type="number"
                     min={1}
                     value={teamSize}
                     placeholder={m.tournamentCreate_placeholders_teamSize()}
                     oninput={(event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        teamSize = target.value;
                     }}
                  />
               </div>

               <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                     <Label for="tournament-minimum-rank">
                        {m.tournamentCreate_fields_minimumRank()}
                     </Label>
                     <Input
                        id="tournament-minimum-rank"
                        type="number"
                        min={1}
                        value={minimumRank}
                        placeholder={m.tournamentCreate_placeholders_minimumRank()}
                        oninput={(event) => {
                           const target =
                              event.currentTarget as HTMLInputElement;
                           minimumRank = target.value;
                        }}
                     />
                  </div>

                  <div class="space-y-2">
                     <Label for="tournament-maximum-rank">
                        {m.tournamentCreate_fields_maximumRank()}
                     </Label>
                     <Input
                        id="tournament-maximum-rank"
                        type="number"
                        min={1}
                        value={maximumRank}
                        placeholder={m.tournamentCreate_placeholders_maximumRank()}
                        oninput={(event) => {
                           const target =
                              event.currentTarget as HTMLInputElement;
                           maximumRank = target.value;
                        }}
                     />
                  </div>
               </div>

               <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                     <Label for="tournament-minimum-rating">
                        {m.tournamentCreate_fields_minimumRating()}
                     </Label>
                     <Input
                        id="tournament-minimum-rating"
                        type="number"
                        value={minimumRating}
                        placeholder={m.tournamentCreate_placeholders_minimumRating()}
                        oninput={(event) => {
                           const target =
                              event.currentTarget as HTMLInputElement;
                           minimumRating = target.value;
                        }}
                     />
                  </div>

                  <div class="space-y-2">
                     <Label for="tournament-maximum-rating">
                        {m.tournamentCreate_fields_maximumRating()}
                     </Label>
                     <Input
                        id="tournament-maximum-rating"
                        type="number"
                        value={maximumRating}
                        placeholder={m.tournamentCreate_placeholders_maximumRating()}
                        oninput={(event) => {
                           const target =
                              event.currentTarget as HTMLInputElement;
                           maximumRating = target.value;
                        }}
                     />
                  </div>
               </div>

               <div class="space-y-2">
                  <Label for="tournament-allowed-countries">
                     {m.tournamentCreate_fields_allowedCountries()}
                  </Label>
                  <Input
                     id="tournament-allowed-countries"
                     value={allowedCountries}
                     placeholder={m.tournamentCreate_placeholders_allowedCountries()}
                     oninput={(event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        allowedCountries = target.value;
                     }}
                  />
               </div>

               {#if settingsError}
                  <p class="text-destructive text-sm">{settingsError}</p>
               {/if}

               <div class="flex items-center justify-between">
                  <Button variant="outline" onclick={handleBack}>
                     {m.tournamentCreate_back()}
                  </Button>

                  <Button type="submit" disabled={settingsSubmitting}>
                     {#if settingsSubmitting}
                        {m.tournamentCreate_loading()}
                     {:else}
                        {m.tournamentCreate_next()}
                     {/if}
                  </Button>
               </div>
            </form>
         {:else}
            <div class="space-y-2">
               <h2 class="text-xl font-semibold">
                  {m.tournamentCreate_discord_title()}
               </h2>
               <p class="text-muted-foreground text-sm">
                  {m.tournamentCreate_discord_description()}
               </p>
               <p class="text-muted-foreground text-sm">
                  {m.tournamentCreate_discord_optional()}
               </p>
            </div>

            <div class="flex items-center justify-between">
               <Button variant="outline" onclick={handleBack}>
                  {m.tournamentCreate_back()}
               </Button>

               <div class="flex items-center gap-2">
                  <Button variant="outline" onclick={handleFinish}>
                     {m.tournamentCreate_discord_skip()}
                  </Button>
                  <Button onclick={handleFinish}>
                     {m.tournamentCreate_finish()}
                  </Button>
               </div>
            </div>
         {/if}
      </div>
   </Stepper>
</div>
