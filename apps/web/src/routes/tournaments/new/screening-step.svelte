<script lang="ts">
   import {
      HelpCircleIcon,
      RankingIcon,
      StarIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { m } from "$i18n/messages";
   import CountryMultiSelect from "$lib/components/country-multi-select.svelte";
   import { defaults, superForm } from "sveltekit-superforms";
   import { zod4, zod4Client } from "sveltekit-superforms/adapters";
   import { z } from "zod/v4";

   import { Button } from "@ota/ui/components/button/index.ts";
   import { Checkbox } from "@ota/ui/components/checkbox/index.ts";
   import * as Form from "@ota/ui/components/form/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import * as Tooltip from "@ota/ui/components/tooltip/index.ts";

   const settingsSchema = z
      .object({
         minimumRank: z.string(),
         maximumRank: z.string(),
         minimumRating: z.string(),
         maximumRating: z.string(),
         allowedCountries: z.array(z.string()),
         useBws: z.boolean(),
         minimumBadges: z.string(),
         bwsExponent: z.string(),
      })
      .superRefine((data, ctx) => {
         const settingsError = m.tournamentCreate_errors_settingsFailed();
         const parsedMinimumRank = parseOptionalInt(data.minimumRank);
         const parsedMaximumRank = parseOptionalInt(data.maximumRank);
         const parsedMinimumRating = parseOptionalInt(data.minimumRating);
         const parsedMaximumRating = parseOptionalInt(data.maximumRating);
         const parsedMinimumBadges = parseOptionalInt(data.minimumBadges);
         const parsedBwsExponent = parseOptionalFloat(data.bwsExponent);

         if (
            parsedMinimumRank !== undefined &&
            parsedMaximumRank !== undefined &&
            parsedMinimumRank > parsedMaximumRank
         ) {
            ctx.addIssue({
               code: "custom",
               path: ["maximumRank"],
               message: settingsError,
            });
         }

         if (
            parsedMinimumRating !== undefined &&
            parsedMaximumRating !== undefined &&
            parsedMinimumRating > parsedMaximumRating
         ) {
            ctx.addIssue({
               code: "custom",
               path: ["maximumRating"],
               message: settingsError,
            });
         }

         if (data.useBws) {
            if (parsedMinimumBadges !== undefined && parsedMinimumBadges < 0) {
               ctx.addIssue({
                  code: "custom",
                  path: ["minimumBadges"],
                  message: settingsError,
               });
            }

            if (
               parsedBwsExponent !== undefined &&
               (parsedBwsExponent <= 0 || parsedBwsExponent >= 1)
            ) {
               ctx.addIssue({
                  code: "custom",
                  path: ["bwsExponent"],
                  message: settingsError,
               });
            }
         }
      });

   const settingsForm = $state(
      superForm(
         defaults(
            {
               minimumRank: "",
               maximumRank: "",
               minimumRating: "",
               maximumRating: "",
               allowedCountries: [] as string[],
               useBws: false,
               minimumBadges: "",
               bwsExponent: "0.9937",
            },
            zod4(settingsSchema),
         ),
         {
            validators: zod4Client(settingsSchema),
            SPA: true,
         },
      ),
   );

   const { form: formData, validateForm } = settingsForm;

   export { formData, validateForm, settingsForm };

   function parseOptionalInt(value: string) {
      const trimmed = value.trim();
      if (!trimmed) {
         return undefined;
      }

      if (!/^[+-]?\d+$/.test(trimmed)) {
         return undefined;
      }

      const parsed = Number(trimmed);
      if (!Number.isInteger(parsed)) {
         return undefined;
      }

      return parsed;
   }

   function parseOptionalFloat(value: string) {
      const trimmed = value.trim();
      if (!trimmed) {
         return undefined;
      }

      if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
         return undefined;
      }

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
         return undefined;
      }

      return parsed;
   }

   interface Props {
      onSubmit: (data: {
         minimumRank?: number;
         maximumRank?: number;
         minimumRating?: number;
         maximumRating?: number;
         allowedCountries?: string[] | null;
         useBws?: boolean;
         minimumBadges?: number;
         bwsExponent?: number;
      }) => Promise<void>;
      submitting?: boolean;
      error?: boolean;
      onBack?: () => void;
   }

   let {
      onSubmit,
      submitting = false,
      error = false,
      onBack = () => {
         return void 0;
      },
   }: Props = $props();

   async function handleSubmit() {
      const validation = await validateForm({ update: true });
      if (!validation.valid) {
         return;
      }

      const parsedMinimumRank = parseOptionalInt(validation.data.minimumRank);
      const parsedMaximumRank = parseOptionalInt(validation.data.maximumRank);
      const parsedMinimumRating = parseOptionalInt(
         validation.data.minimumRating,
      );
      const parsedMaximumRating = parseOptionalInt(
         validation.data.maximumRating,
      );
      const parsedAllowedCountries = validation.data.allowedCountries.map(
         (country: string) => country.toUpperCase(),
      );
      const normalizedAllowedCountries =
         parsedAllowedCountries.length > 0 ? parsedAllowedCountries : null;

      if (
         parsedMinimumRank !== undefined &&
         parsedMaximumRank !== undefined &&
         parsedMinimumRank > parsedMaximumRank
      ) {
         return;
      }

      if (
         parsedMinimumRating !== undefined &&
         parsedMaximumRating !== undefined &&
         parsedMinimumRating > parsedMaximumRating
      ) {
         return;
      }

      const parsedMinimumBadges = parseOptionalInt(
         validation.data.minimumBadges,
      );
      const parsedBwsExponent = parseOptionalFloat(validation.data.bwsExponent);
      const useBws = validation.data.useBws ?? false;

      if (useBws) {
         if (parsedMinimumBadges !== undefined && parsedMinimumBadges < 0) {
            return;
         }

         if (
            parsedBwsExponent !== undefined &&
            (parsedBwsExponent <= 0 || parsedBwsExponent >= 1)
         ) {
            return;
         }
      }

      await onSubmit({
         minimumRank: parsedMinimumRank,
         maximumRank: parsedMaximumRank,
         minimumRating: parsedMinimumRating,
         maximumRating: parsedMaximumRating,
         allowedCountries: normalizedAllowedCountries,
         useBws,
         ...(useBws && {
            minimumBadges: parsedMinimumBadges,
            bwsExponent: parsedBwsExponent,
         }),
      });
   }
</script>

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
      void handleSubmit();
   }}
>
   <div class="grid gap-4 sm:grid-cols-2">
      <Form.Field form={settingsForm} name="minimumRank">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <HugeiconsIcon
                     icon={RankingIcon}
                     size={16}
                     strokeWidth={1.7}
                  />
                  <Form.Label
                     >{m.tournamentCreate_fields_minimumRank()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.common_optional()})
                  </span>
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_minimumRank()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="number"
                  min={1}
                  placeholder="1"
                  bind:value={$formData.minimumRank}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={settingsForm} name="maximumRank">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <HugeiconsIcon
                     icon={RankingIcon}
                     size={16}
                     strokeWidth={1.7}
                  />
                  <Form.Label
                     >{m.tournamentCreate_fields_maximumRank()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.common_optional()})
                  </span>
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_maximumRank()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="number"
                  min={1}
                  placeholder="10000"
                  bind:value={$formData.maximumRank}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>
   </div>

   <div class="grid gap-4 sm:grid-cols-2">
      <Form.Field form={settingsForm} name="minimumRating">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <HugeiconsIcon icon={StarIcon} size={16} strokeWidth={1.7} />
                  <Form.Label
                     >{m.tournamentCreate_fields_minimumRating()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.common_optional()})
                  </span>
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_minimumRating()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="number"
                  placeholder="0"
                  bind:value={$formData.minimumRating}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={settingsForm} name="maximumRating">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <HugeiconsIcon icon={StarIcon} size={16} strokeWidth={1.7} />
                  <Form.Label
                     >{m.tournamentCreate_fields_maximumRating()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.common_optional()})
                  </span>
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_maximumRating()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="number"
                  placeholder="5000"
                  bind:value={$formData.maximumRating}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>
   </div>

   <Form.Field form={settingsForm} name="allowedCountries">
      <Form.Control>
         <div class="space-y-2">
            <div class="flex items-center gap-2">
               <Form.Label
                  >{m.tournamentCreate_fields_allowedCountries()}</Form.Label
               >
               <span class="text-muted-foreground text-xs">
                  ({m.common_optional()})
               </span>
               <Tooltip.Root>
                  <Tooltip.Trigger>
                     <HugeiconsIcon
                        icon={HelpCircleIcon}
                        size={14}
                        strokeWidth={1.7}
                     />
                  </Tooltip.Trigger>
                  <Tooltip.Content
                     >{m.tournamentCreate_help_allowedCountries()}</Tooltip.Content
                  >
               </Tooltip.Root>
            </div>
            <div class="space-y-2">
               <CountryMultiSelect bind:value={$formData.allowedCountries} />
            </div>
            <Form.FieldErrors />
         </div>
      </Form.Control>
   </Form.Field>

   <Form.Field
      form={settingsForm}
      name="useBws"
      class="flex flex-row items-center gap-2 space-y-0"
   >
      <Form.Control>
         <Checkbox bind:checked={$formData.useBws} class="h-4 w-4" />
         <Form.Label class="font-normal">
            {m.tournamentCreate_fields_useBws()}
         </Form.Label>
      </Form.Control>
      <Tooltip.Root>
         <Tooltip.Trigger>
            <HugeiconsIcon icon={HelpCircleIcon} size={14} strokeWidth={1.7} />
         </Tooltip.Trigger>
         <Tooltip.Content>{m.tournamentCreate_help_useBws()}</Tooltip.Content>
      </Tooltip.Root>
   </Form.Field>

   {#if $formData.useBws}
      <Form.Field form={settingsForm} name="minimumBadges">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <Form.Label
                     >{m.tournamentCreate_fields_minimumBadges()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.common_optional()})
                  </span>
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_minimumBadges()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  bind:value={$formData.minimumBadges}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={settingsForm} name="bwsExponent">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <Form.Label
                     >{m.tournamentCreate_fields_bwsExponent()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.common_optional()})
                  </span>
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_bwsExponent()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="number"
                  min={0.1}
                  max={1}
                  step={0.0001}
                  placeholder="0.9937"
                  bind:value={$formData.bwsExponent}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>
   {/if}

   {#if error}
      <p class="text-destructive text-sm">
         {m.tournamentCreate_errors_settingsFailed()}
      </p>
   {/if}

   <div class="flex items-center justify-between">
      <Button variant="outline" onclick={onBack}>
         {m.common_previous()}
      </Button>

      <Button type="submit" disabled={submitting}>
         {#if submitting}
            {m.common_loading()}
         {:else}
            {m.common_next()}
         {/if}
      </Button>
   </div>
</form>
