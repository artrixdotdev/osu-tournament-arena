<script lang="ts">
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

   let idLocked = $state(true);
   let id = $state("");
   let name = $state("");
   let acronym = $state("");
   let rendition = $state("");
   let description = $state("");
   let startDate = $state("");
   let endDate = $state("");

   let toasts = $state<Toast[]>([]);

   const currentStep = $derived(steps[currentStepIndex]?.id ?? "details");
   const completedSteps = $derived(
      steps.slice(0, currentStepIndex).map((step) => step.id),
   );

   const isFirstStep = $derived(currentStepIndex === 0);
   const isLastStep = $derived(currentStepIndex === steps.length - 1);

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

   function handleStepNavigation() {
      if (currentStep === "details") {
         void handleDetailsSubmit();
         return;
      }

      if (!isLastStep) {
         currentStepIndex += 1;
      }
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

            <div class="flex items-center justify-between">
               <Button variant="outline" onclick={handleBack}>
                  {m.tournamentCreate_back()}
               </Button>

               <Button onclick={handleStepNavigation}>
                  {m.tournamentCreate_next()}
               </Button>
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

            <div class="flex items-center justify-between">
               <Button variant="outline" onclick={handleBack}>
                  {m.tournamentCreate_back()}
               </Button>

               <Button disabled>{m.tournamentCreate_finish()}</Button>
            </div>
         {/if}
      </div>
   </Stepper>
</div>
