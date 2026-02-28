<script lang="ts">
   import { HelpCircleIcon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { m } from "$i18n/messages";
   import CountryMultiSelect from "$lib/components/country-multi-select.svelte";
   import { defaults, superForm } from "sveltekit-superforms";
   import { zod4, zod4Client } from "sveltekit-superforms/adapters";
   import { z } from "zod/v4";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as Form from "@ota/ui/components/form/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import * as Tooltip from "@ota/ui/components/tooltip/index.ts";

   const settingsSchema = z
      .object({
         teamSize: z.string(),
         minimumRank: z.string(),
         maximumRank: z.string(),
         minimumRating: z.string(),
         maximumRating: z.string(),
         allowedCountries: z.array(z.string()),
      })
      .superRefine((data, ctx) => {
         const settingsError = m.tournamentCreate_errors_settingsFailed();
         const parsedTeamSize = parseOptionalInt(data.teamSize);
         const parsedMinimumRank = parseOptionalInt(data.minimumRank);
         const parsedMaximumRank = parseOptionalInt(data.maximumRank);
         const parsedMinimumRating = parseOptionalInt(data.minimumRating);
         const parsedMaximumRating = parseOptionalInt(data.maximumRating);

         if (parsedTeamSize === undefined || parsedTeamSize <= 0) {
            ctx.addIssue({
               code: "custom",
               path: ["teamSize"],
               message: settingsError,
            });
         }

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
      });

   const settingsForm = $state(
      superForm(
         defaults(
            {
               teamSize: "8",
               minimumRank: "",
               maximumRank: "",
               minimumRating: "",
               maximumRating: "",
               allowedCountries: [] as string[],
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
      if (!value.trim()) {
         return undefined;
      }

      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) {
         return undefined;
      }

      return parsed;
   }

   interface Props {
      onSubmit: (data: {
         teamSize: number;
         minimumRank?: number;
         maximumRank?: number;
         minimumRating?: number;
         maximumRating?: number;
         allowedCountries: string[];
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

      const parsedTeamSize = parseOptionalInt(validation.data.teamSize);
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

      if (parsedTeamSize === undefined || parsedTeamSize <= 0) {
         return;
      }

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

      await onSubmit({
         teamSize: parsedTeamSize,
         minimumRank: parsedMinimumRank,
         maximumRank: parsedMaximumRank,
         minimumRating: parsedMinimumRating,
         maximumRating: parsedMaximumRating,
         allowedCountries: parsedAllowedCountries,
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
   <Form.Field form={settingsForm} name="teamSize">
      <Form.Control>
         <div class="space-y-2">
            <div class="flex items-center gap-2">
               <Form.Label>{m.tournamentCreate_fields_teamSize()}</Form.Label>
               <Tooltip.Root>
                  <Tooltip.Trigger>
                     <HugeiconsIcon
                        icon={HelpCircleIcon}
                        size={14}
                        strokeWidth={1.7}
                     />
                  </Tooltip.Trigger>
                  <Tooltip.Content
                     >{m.tournamentCreate_help_teamSize()}</Tooltip.Content
                  >
               </Tooltip.Root>
            </div>
            <Input
               type="number"
               min={1}
               placeholder={m.tournamentCreate_placeholders_teamSize()}
               bind:value={$formData.teamSize}
            />
            <Form.FieldErrors />
         </div>
      </Form.Control>
   </Form.Field>

   <div class="grid gap-4 sm:grid-cols-2">
      <Form.Field form={settingsForm} name="minimumRank">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <Form.Label
                     >{m.tournamentCreate_fields_minimumRank()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.tournamentCreate_meta_optional()})
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
                  placeholder={m.tournamentCreate_placeholders_minimumRank()}
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
                  <Form.Label
                     >{m.tournamentCreate_fields_maximumRank()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.tournamentCreate_meta_optional()})
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
                  placeholder={m.tournamentCreate_placeholders_maximumRank()}
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
                  <Form.Label
                     >{m.tournamentCreate_fields_minimumRating()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.tournamentCreate_meta_optional()})
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
                  placeholder={m.tournamentCreate_placeholders_minimumRating()}
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
                  <Form.Label
                     >{m.tournamentCreate_fields_maximumRating()}</Form.Label
                  >
                  <span class="text-muted-foreground text-xs">
                     ({m.tournamentCreate_meta_optional()})
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
                  placeholder={m.tournamentCreate_placeholders_maximumRating()}
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
                  ({m.tournamentCreate_meta_optional()})
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
               <CountryMultiSelect
                  placeholder={m.tournamentCreate_placeholders_allowedCountries()}
                  bind:value={$formData.allowedCountries}
               />
            </div>
            <Form.FieldErrors />
         </div>
      </Form.Control>
   </Form.Field>

   {#if error}
      <p class="text-destructive text-sm">
         {m.tournamentCreate_errors_settingsFailed()}
      </p>
   {/if}

   <div class="flex items-center justify-between">
      <Button variant="outline" onclick={onBack}>
         {m.tournamentCreate_back()}
      </Button>

      <Button type="submit" disabled={submitting}>
         {#if submitting}
            {m.tournamentCreate_loading()}
         {:else}
            {m.tournamentCreate_next()}
         {/if}
      </Button>
   </div>
</form>
