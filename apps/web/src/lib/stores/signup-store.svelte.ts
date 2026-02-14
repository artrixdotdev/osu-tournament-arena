import { writable } from "svelte/store";

import type { SignupStatus, SignupStep } from "./signup-types";

/**
 * Internal state shape for the signup store.
 */
interface SignupState {
   /** ID of the currently active step */
   currentStep: SignupStep;
   /** Array of step IDs that have been completed */
   completedSteps: SignupStep[];
   /** Whether the user has linked their Discord account */
   hasDiscord: boolean;
   /** User's timezone as UTC offset */
   timezone: number;
}

/**
 * Creates a Svelte store for managing the multi-step signup flow.
 *
 * The signup flow consists of three steps:
 * 1. osu - Connect osu! account (required, handled by OAuth)
 * 2. discord - Link Discord account (optional)
 * 3. timezone - Set timezone preference
 *
 * @example
 * ```typescript
 * // Initialize with server data
 * signupStore.initialize({
 *    hasDiscord: false,
 *    timezone: 0,
 *    signupCompleted: false,
 * });
 *
 * // Subscribe to state changes
 * $: state = $signupStore;
 *
 * // Mark a step as complete
 * signupStore.completeStep("discord");
 *
 * // Update timezone
 * signupStore.setTimezone(-5);
 * ```
 */
function createSignupStore() {
   const initialState: SignupState = {
      currentStep: "osu",
      completedSteps: [],
      hasDiscord: false,
      timezone: 0,
   };

   const { subscribe, set, update } = writable<SignupState>(initialState);

   return {
      subscribe,

      /**
       * Initializes the store with data from the server.
       * Determines the current step and completed steps based on signup status.
       *
       * @param data - Signup status from the API
       */
      initialize: (data: SignupStatus) => {
         update((state) => ({
            ...state,
            hasDiscord: data.hasDiscord,
            timezone: data.timezone,
            currentStep: data.signupCompleted ? "timezone" : "discord",
            completedSteps: data.signupCompleted
               ? (["osu", "discord", "timezone"] as SignupStep[])
               : (["osu"] as SignupStep[]),
         }));
      },

      /**
       * Marks a step as complete and advances to the next step.
       * Does nothing if the step is already completed.
       *
       * @param step - The step ID to mark as complete
       */
      completeStep: (step: SignupStep) => {
         update((state) => {
            const completedSteps = state.completedSteps.includes(step)
               ? state.completedSteps
               : [...state.completedSteps, step];
            const stepOrder: SignupStep[] = ["osu", "discord", "timezone"];
            const currentIndex = stepOrder.indexOf(step);
            const nextStep = stepOrder[currentIndex + 1];
            return {
               ...state,
               completedSteps,
               currentStep: nextStep ?? state.currentStep,
            };
         });
      },

      /**
       * Updates the Discord link status.
       * @param hasDiscord - Whether Discord is linked
       */
      setHasDiscord: (hasDiscord: boolean) => {
         update((state) => ({ ...state, hasDiscord }));
      },

      /**
       * Updates the timezone preference.
       * @param timezone - UTC offset from -12 to +14
       */
      setTimezone: (timezone: number) => {
         update((state) => ({ ...state, timezone }));
      },

      /**
       * Resets the store to initial state.
       */
      reset: () => set(initialState),
   };
}

export const signupStore = createSignupStore();
