<script lang="ts">
   import {
      CalendarIcon,
      HelpCircleIcon,
      MeetingRoomIcon,
      SquareLock01Icon,
      SquareUnlock01Icon,
      UserGroupIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { m } from "$i18n/messages";
   import { client } from "$lib/orpc";
   import {
      numericInputAsStringSchema,
      parseOptionalInt,
   } from "$lib/utils/number";
   import { parseISO } from "date-fns";
   import { defaults, superForm } from "sveltekit-superforms";
   import { zod4, zod4Client } from "sveltekit-superforms/adapters";
   import { z } from "zod/v4";

   import { TOURNAMENT_ACRONYM_MAX_LENGTH } from "@ota/db/schema";
   import { uploadFile } from "@ota/storage/client";
   import { Button } from "@ota/ui/components/button/index.ts";
   import * as Form from "@ota/ui/components/form/index.ts";
   import { ImageUpload } from "@ota/ui/components/image-upload/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import { Textarea } from "@ota/ui/components/textarea/index.ts";
   import * as Tooltip from "@ota/ui/components/tooltip/index.ts";

   interface Props {
      onSubmit: (data: {
         id: string;
         name: string;
         acronym: string | null;
         rendition: number | null;
         description: string | null;
         startDate: string;
         endDate: string;
         teamSize: number;
         lobbySize: number;
         bannerUrl: string | null;
         iconUrl: string | null;
      }) => Promise<void>;
      submitting?: boolean;
      error?: string | null;
      isFirstStep?: boolean;
      onBack?: () => void;
   }

   let {
      onSubmit,
      submitting = $bindable(false),
      error = $bindable(null),
      isFirstStep = false,
      onBack = () => {
         return void 0;
      },
   }: Props = $props();

   const detailsSchema = z
      .object({
         id: z.string().trim().min(1, m.tournamentCreate_errors_requiredId()),
         name: z
            .string()
            .trim()
            .min(1, m.tournamentCreate_errors_requiredName()),
         acronym: z
            .string()
            .trim()
            .max(
               TOURNAMENT_ACRONYM_MAX_LENGTH,
               m.tournamentCreate_errors_acronymTooLong({
                  max: TOURNAMENT_ACRONYM_MAX_LENGTH,
               }),
            ),
         rendition: z.union([z.string().trim(), z.number(), z.null()]).refine(
            (value) => {
               if (value === "" || value === null) {
                  return true;
               }

               if (typeof value === "number") {
                  return Number.isInteger(value) && value > 0;
               }

               return /^\d+$/.test(value);
            },
            {
               message: m.tournamentCreate_errors_invalidRendition(),
            },
         ),
         description: z.string(),
         startDate: z
            .string()
            .min(1, m.tournamentCreate_errors_requiredStartDate()),
         endDate: z
            .string()
            .min(1, m.tournamentCreate_errors_requiredEndDate()),
         teamSize: numericInputAsStringSchema,
         lobbySize: numericInputAsStringSchema,
         bannerUrl: z.url().nullish(),
         iconUrl: z.url().nullish(),
      })
      .refine(
         (data) => {
            if (!data.startDate || !data.endDate) {
               return true;
            }

            return parseISO(data.endDate) >= parseISO(data.startDate);
         },
         {
            path: ["endDate"],
            message: m.tournamentCreate_errors_invalidDateRange(),
         },
      )
      .superRefine((data, ctx) => {
         const parsedTeamSize = parseOptionalInt(data.teamSize);
         const parsedLobbySize = parseOptionalInt(data.lobbySize);

         if (parsedTeamSize === undefined || parsedTeamSize <= 0) {
            ctx.addIssue({
               code: "custom",
               path: ["teamSize"],
               message: m.tournamentCreate_errors_invalidTeamSize(),
            });
         }

         if (parsedLobbySize === undefined || parsedLobbySize <= 0) {
            ctx.addIssue({
               code: "custom",
               path: ["lobbySize"],
               message: m.tournamentCreate_errors_invalidLobbySize(),
            });
         }

         if (
            parsedTeamSize !== undefined &&
            parsedLobbySize !== undefined &&
            parsedLobbySize < parsedTeamSize
         ) {
            ctx.addIssue({
               code: "custom",
               path: ["lobbySize"],
               message: m.tournamentCreate_errors_lobbySizeTooSmall(),
            });
         }
      });

   const detailsForm = superForm(
      defaults(
         {
            id: "",
            name: "",
            acronym: "",
            rendition: "",
            description: "",
            startDate: "",
            endDate: "",
            teamSize: "8",
            lobbySize: "16",
            bannerUrl: null,
            iconUrl: null,
         },
         zod4(detailsSchema),
      ),
      {
         validators: zod4Client(detailsSchema),
         SPA: true,
      },
   );

   const { form: detailsFormData, validateForm: validateDetailsForm } =
      detailsForm;

   let idLocked = $state(true);

   $effect(() => {
      if (idLocked) {
         const slug = slugify($detailsFormData.name);
         if ($detailsFormData.id !== slug) {
            $detailsFormData.id = slug;
         }
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

   function toggleIdLock() {
      idLocked = !idLocked;
      if (idLocked) {
         $detailsFormData.id = slugify($detailsFormData.name);
      }
   }

   async function uploadImage(file: File, mediaType: "banner" | "icon") {
      const { uploadUrl, publicUrl, previewUrl } =
         await client.storage.generateUploadUrl({
         mediaType,
         contentType: file.type,
         public: true,
      });

      await uploadFile(uploadUrl, file);

      return { publicUrl, previewUrl };
   }

   const bannerUploadFn = (file: File) => uploadImage(file, "banner");
   const iconUploadFn = (file: File) => uploadImage(file, "icon");

   async function handleSubmit() {
      const validation = await validateDetailsForm({ update: true });
      if (!validation.valid) {
         return;
      }

      const renditionInput = validation.data.rendition;
      const normalizedRendition =
         renditionInput === "" || renditionInput === null
            ? null
            : typeof renditionInput === "number"
              ? renditionInput
              : Number(renditionInput);

      const parsedTeamSize = parseOptionalInt(validation.data.teamSize);
      const parsedLobbySize = parseOptionalInt(validation.data.lobbySize);

      await onSubmit({
         id: validation.data.id.trim(),
         name: validation.data.name.trim(),
         acronym: validation.data.acronym.trim()
            ? validation.data.acronym.trim()
            : null,
         rendition: normalizedRendition,
         description: validation.data.description.trim()
            ? validation.data.description.trim()
            : null,
         startDate: validation.data.startDate,
         endDate: validation.data.endDate,
         teamSize: parsedTeamSize ?? 8,
         lobbySize: parsedLobbySize ?? 16,
         bannerUrl: validation.data.bannerUrl ?? null,
         iconUrl: validation.data.iconUrl ?? null,
      });
   }

   export const formData = detailsFormData;
   export const validateForm = validateDetailsForm;
</script>

<form
   class="space-y-4"
   onsubmit={(event) => {
      event.preventDefault();
      void handleSubmit();
   }}
>
   <Form.Field form={detailsForm} name="id">
      <Form.Control>
         <div class="space-y-2">
            <div class="flex items-center gap-2">
               <Form.Label>{m.tournamentCreate_fields_id()}</Form.Label>
               <Tooltip.Root>
                  <Tooltip.Trigger>
                     <HugeiconsIcon icon={HelpCircleIcon} size={14} />
                  </Tooltip.Trigger>
                  <Tooltip.Content
                     >{m.tournamentCreate_help_id()}</Tooltip.Content
                  >
               </Tooltip.Root>
            </div>
            <div class="relative">
               <Input
                  placeholder="tournament-id"
                  readonly={idLocked}
                  disabled={idLocked}
                  bind:value={$detailsFormData.id}
               />
               <button
                  type="button"
                  class="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
                  onclick={toggleIdLock}
                  aria-label={idLocked
                     ? m.tournamentCreate_actions_unlockId()
                     : m.tournamentCreate_actions_lockId()}
                  title={idLocked
                     ? m.tournamentCreate_actions_unlockId()
                     : m.tournamentCreate_actions_lockId()}
               >
                  {#if idLocked}
                     <HugeiconsIcon icon={SquareLock01Icon} size={16} />
                  {:else}
                     <HugeiconsIcon icon={SquareUnlock01Icon} size={16} />
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
            <Form.FieldErrors />
         </div>
      </Form.Control>
   </Form.Field>

   <Form.Field form={detailsForm} name="name">
      <Form.Control>
         <div class="space-y-2">
            <div class="flex items-center gap-2">
               <Form.Label>{m.tournamentCreate_fields_name()}</Form.Label>
               <Tooltip.Root>
                  <Tooltip.Trigger>
                     <HugeiconsIcon
                        icon={HelpCircleIcon}
                        size={14}
                        strokeWidth={1.7}
                     />
                  </Tooltip.Trigger>
                  <Tooltip.Content
                     >{m.tournamentCreate_help_name()}</Tooltip.Content
                  >
               </Tooltip.Root>
            </div>
            <Input
               placeholder="osu! Team Championship 2026"
               bind:value={$detailsFormData.name}
            />
            <Form.FieldErrors />
         </div>
      </Form.Control>
   </Form.Field>

   <div class="grid gap-4 sm:grid-cols-2">
      <Form.Field form={detailsForm} name="acronym">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <Form.Label>{m.tournamentCreate_fields_acronym()}</Form.Label>
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
                        >{m.tournamentCreate_help_acronym()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  maxlength={TOURNAMENT_ACRONYM_MAX_LENGTH}
                  placeholder="OTC6"
                  bind:value={$detailsFormData.acronym}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={detailsForm} name="rendition">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <Form.Label
                     >{m.tournamentCreate_fields_rendition()}</Form.Label
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
                        >{m.tournamentCreate_help_rendition()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="number"
                  min={1}
                  placeholder="6"
                  bind:value={$detailsFormData.rendition}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>
   </div>

   <Form.Field form={detailsForm} name="description">
      <Form.Control>
         <div class="space-y-2">
            <div class="flex items-center gap-2">
               <Form.Label>{m.tournamentCreate_fields_description()}</Form.Label
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
                     >{m.tournamentCreate_help_description()}</Tooltip.Content
                  >
               </Tooltip.Root>
            </div>
            <Textarea
               placeholder="A short summary of the tournament."
               bind:value={$detailsFormData.description}
            />
            <Form.FieldErrors />
         </div>
      </Form.Control>
   </Form.Field>

   <div class="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <ImageUpload
         label="Banner"
         hint="Optional tournament banner displayed on the tournament page"
         variant="banner"
         uploadFn={bannerUploadFn}
         bind:value={$detailsFormData.bannerUrl}
      />

      <ImageUpload
         label="Icon"
         hint="Optional tournament icon/logo"
         variant="icon"
         accept="image/jpeg,image/png,image/webp"
         uploadFn={iconUploadFn}
         bind:value={$detailsFormData.iconUrl}
      />
   </div>

   <div class="grid gap-4 sm:grid-cols-2">
      <Form.Field form={detailsForm} name="startDate">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <HugeiconsIcon
                     icon={CalendarIcon}
                     size={16}
                     strokeWidth={1.7}
                  />
                  <Form.Label
                     >{m.tournamentCreate_fields_startDate()}</Form.Label
                  >
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_startDate()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input type="date" bind:value={$detailsFormData.startDate} />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={detailsForm} name="endDate">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <HugeiconsIcon
                     icon={CalendarIcon}
                     size={16}
                     strokeWidth={1.7}
                  />
                  <Form.Label>{m.tournamentCreate_fields_endDate()}</Form.Label>
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_endDate()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="date"
                  min={$detailsFormData.startDate ?? undefined}
                  bind:value={$detailsFormData.endDate}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>
   </div>

   <div class="grid gap-4 sm:grid-cols-2">
      <Form.Field form={detailsForm} name="teamSize">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <HugeiconsIcon
                     icon={UserGroupIcon}
                     size={16}
                     strokeWidth={1.7}
                  />
                  <Form.Label>{m.tournamentCreate_fields_teamSize()}</Form.Label
                  >
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
                  placeholder="8"
                  bind:value={$detailsFormData.teamSize}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={detailsForm} name="lobbySize">
         <Form.Control>
            <div class="space-y-2">
               <div class="flex items-center gap-2">
                  <HugeiconsIcon
                     icon={MeetingRoomIcon}
                     size={16}
                     strokeWidth={1.7}
                  />
                  <Form.Label
                     >{m.tournamentCreate_fields_lobbySize()}</Form.Label
                  >
                  <Tooltip.Root>
                     <Tooltip.Trigger>
                        <HugeiconsIcon
                           icon={HelpCircleIcon}
                           size={14}
                           strokeWidth={1.7}
                        />
                     </Tooltip.Trigger>
                     <Tooltip.Content
                        >{m.tournamentCreate_help_lobbySize()}</Tooltip.Content
                     >
                  </Tooltip.Root>
               </div>
               <Input
                  type="number"
                  min={1}
                  placeholder="16"
                  bind:value={$detailsFormData.lobbySize}
               />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>
   </div>

   {#if error}
      <p class="text-destructive text-sm">{error}</p>
   {/if}

   <div class="flex items-center justify-between">
      <Button variant="outline" onclick={onBack} disabled={isFirstStep}>
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
