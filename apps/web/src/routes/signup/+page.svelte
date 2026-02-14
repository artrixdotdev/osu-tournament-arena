<script lang="ts">
   import { goto } from "$app/navigation";
   import { client } from "$lib/orpc";
   import { signupStore } from "$lib/stores/signup-store.svelte";
   import { SIGNUP_STEPS, TIMEZONE_OPTIONS } from "$lib/stores/signup-types";

   import { authClient } from "@ota/auth/client";
   import { Button } from "@ota/ui/components/button/index.ts";
   import { Stepper } from "@ota/ui/components/stepper/index.ts";

   let { data } = $props();

   let status = $state<{
      hasDiscord: boolean;
      timezone: number;
      signupCompleted: boolean;
   } | null>(null);

   let loading = $state(false);
   let error = $state<string | null>(null);

   async function loadStatus() {
      try {
         const result = await client.user.getSignupStatus();
         if (result) {
            status = {
               hasDiscord: result.discordId !== null,
               timezone: result.timezone,
               signupCompleted: result.signupCompletedAt !== null,
            };
            signupStore.initialize(status);
            if (status.hasDiscord) {
               signupStore.completeStep("discord");
            }
         }
      } catch (e) {
         console.error("Failed to load signup status:", e);
      }
   }

   async function handleDiscordLink() {
      loading = true;
      error = null;
      try {
         await authClient.linkSocial({
            provider: "discord",
            callbackURL: "/signup",
         });
      } catch (e) {
         error = "Failed to link Discord. Please try again.";
         console.error(e);
      } finally {
         loading = false;
      }
   }

   function handleSkipDiscord() {
      signupStore.completeStep("discord");
   }

   async function handleTimezoneSubmit() {
      loading = true;
      error = null;
      try {
         const state = $signupStore;
         await client.user.updateTimezone({ timezone: state.timezone });
         await client.user.completeSignup({});
         signupStore.completeStep("timezone");
         void goto("/");
      } catch (e) {
         error = "Failed to save timezone. Please try again.";
         console.error(e);
      } finally {
         loading = false;
      }
   }

   function handleTimezoneChange(event: Event) {
      const target = event.target as HTMLSelectElement;
      signupStore.setTimezone(parseInt(target.value, 10));
   }

   $effect(() => {
      if (data.user) {
         void loadStatus();
      }
   });
</script>

<svelte:head>
   <title>Complete Signup</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
   <div class="w-full max-w-md space-y-6">
      {#if $signupStore.currentStep === "osu"}
         <div class="text-center">
            <h1 class="text-2xl font-bold">Connect osu!</h1>
            <p class="text-muted-foreground mt-2">
               Click below to sign in with your osu! account
            </p>
            <Button
               class="mt-4"
               onclick={async () => {
                  await authClient.signIn.oauth2({
                     providerId: "osu",
                     callbackURL: "/signup",
                  });
               }}
            >
               Sign in with osu!
            </Button>
         </div>
      {:else}
         <Stepper
            steps={SIGNUP_STEPS}
            currentStep={$signupStore.currentStep}
            completedSteps={$signupStore.completedSteps}
         >
            {#if $signupStore.currentStep === "discord"}
               <div class="space-y-4">
                  <h2 class="text-xl font-semibold">Link Discord Account</h2>
                  <p class="text-muted-foreground">
                     Linking your Discord account allows you to receive
                     tournament notifications and communicate with other
                     players.
                  </p>

                  {#if error}
                     <p class="text-destructive text-sm">{error}</p>
                  {/if}

                  <div class="flex flex-col gap-3">
                     <Button onclick={handleDiscordLink} disabled={loading}>
                        {#if loading}
                           Linking...
                        {:else}
                           Link Discord Account
                        {/if}
                     </Button>

                     <Button
                        variant="ghost"
                        onclick={handleSkipDiscord}
                        disabled={loading}
                     >
                        Skip for now
                     </Button>
                  </div>
               </div>
            {:else if $signupStore.currentStep === "timezone"}
               <div class="space-y-4">
                  <h2 class="text-xl font-semibold">Set Your Timezone</h2>
                  <p class="text-muted-foreground">
                     Select your timezone to help schedule tournament matches at
                     convenient times.
                  </p>

                  {#if error}
                     <p class="text-destructive text-sm">{error}</p>
                  {/if}

                  <div class="space-y-4">
                     <select
                        class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        value={$signupStore.timezone}
                        onchange={handleTimezoneChange}
                     >
                        {#each TIMEZONE_OPTIONS as option (option.value)}
                           <option value={option.value}>{option.label}</option>
                        {/each}
                     </select>

                     <Button onclick={handleTimezoneSubmit} disabled={loading}>
                        {#if loading}
                           Saving...
                        {:else}
                           Complete Signup
                        {/if}
                     </Button>
                  </div>
               </div>
            {/if}
         </Stepper>
      {/if}
   </div>
</div>
