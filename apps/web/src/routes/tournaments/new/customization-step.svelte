<script lang="ts">
   import { m } from "$i18n/messages";
   import TournamentThemeFields from "$lib/components/tournament-theme-fields.svelte";
   import {
      previewTournamentMarkdown,
      uploadTournamentMarkdownFiles,
   } from "$lib/tournament-content";
   import { TOURNAMENT_FONT_OPTIONS } from "$lib/tournament-theme";
   import { defaults, superForm } from "sveltekit-superforms";
   import { zod4, zod4Client } from "sveltekit-superforms/adapters";
   import { z } from "zod/v4";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as Form from "@ota/ui/components/form/index.ts";
   import { MarkdownEditor } from "@ota/ui/components/markdown-editor/index.ts";

   const customizationSchema = z.object({
      body: z.string(),
      fontFamily: z.string(),
   });

   interface Props {
      tournamentId: string;
      submitting?: boolean;
      onBack: () => void;
      onSkip: () => void;
      onSubmit: (payload: {
         body?: string;
         fontFamily?: string | null;
         themeColors?: Record<string, string> | null;
      }) => Promise<void>;
   }

   let {
      tournamentId,
      submitting = false,
      onBack,
      onSkip,
      onSubmit,
   }: Props = $props();

   const customizationForm = superForm(
      defaults(
         {
            body: "",
            fontFamily: "",
         },
         zod4(customizationSchema),
      ),
      {
         validators: zod4Client(customizationSchema),
         SPA: true,
      },
   );

   const { form: formData, validateForm } = customizationForm;

   let themeColors = $state<Record<string, string>>({});

   async function handleSubmit() {
      const validation = await validateForm({ update: true });
      if (!validation.valid) {
         return;
      }

      const hasThemeColors = Object.values(themeColors).some(Boolean);

      await onSubmit({
         body: validation.data.body,
         fontFamily: validation.data.fontFamily || null,
         themeColors: hasThemeColors ? themeColors : null,
      });
   }
</script>

<div class="space-y-2">
   <h2 class="text-xl font-semibold">
      {m.tournamentCreate_customization_title()}
   </h2>
   <p class="text-muted-foreground text-sm">
      {m.tournamentCreate_customization_description()}
   </p>
</div>

<form
   class="space-y-4"
   onsubmit={(event) => {
      event.preventDefault();
      void handleSubmit();
   }}
>
   <details class="group rounded-xl border" open>
      <summary class="flex cursor-pointer list-none items-center justify-between px-4 py-3">
         <div>
            <p class="text-sm font-medium">Content</p>
            <p class="text-muted-foreground text-xs">
               Body copy, embeds, and page copywriting.
            </p>
         </div>
         <span class="text-muted-foreground text-xs transition-transform group-open:rotate-180">
            v
         </span>
      </summary>

      <div class="space-y-3 border-t px-4 py-4">
         <Form.Field form={customizationForm} name="body">
            <Form.Control>
               <div class="space-y-2">
                  <Form.Label>{m.tournamentCreate_fields_pageBody()}</Form.Label>
                  <MarkdownEditor
                     bind:value={$formData.body}
                     placeholder={m.tournamentCreate_help_pageBody()}
                     previewPlaceholder={m.tournamentCreate_help_pageBody()}
                     writeLabel={m.common_write()}
                     previewLabel={m.common_preview()}
                     uploadLabel={m.common_upload()}
                     dropLabel={m.tournamentCreate_hints_markdownMedia()}
                     onPreviewRequest={previewTournamentMarkdown}
                     onUploadFiles={async ({ files }: { files: File[] }) =>
                        await uploadTournamentMarkdownFiles(tournamentId, files)}
                  />
                  <Form.FieldErrors />
               </div>
            </Form.Control>
         </Form.Field>
      </div>
   </details>

   <details class="group rounded-xl border">
      <summary class="flex cursor-pointer list-none items-center justify-between px-4 py-3">
         <div>
            <p class="text-sm font-medium">Appearance</p>
            <p class="text-muted-foreground text-xs">
               Font and theme overrides for the tournament page.
            </p>
         </div>
         <span class="text-muted-foreground text-xs transition-transform group-open:rotate-180">
            v
         </span>
      </summary>

      <div class="space-y-4 border-t px-4 py-4">
         <Form.Field form={customizationForm} name="fontFamily">
            <Form.Control>
               <div class="space-y-2">
                  <Form.Label>{m.tournamentCreate_fields_fontFamily()}</Form.Label>
                  <select
                     class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                     bind:value={$formData.fontFamily}
                  >
                     <option value="">{m.common_optional()}</option>
                     {#each TOURNAMENT_FONT_OPTIONS as font (font)}
                        <option value={font}>{font}</option>
                     {/each}
                  </select>
                  <Form.FieldErrors />
               </div>
            </Form.Control>
         </Form.Field>

         <TournamentThemeFields bind:value={themeColors} disabled={submitting} />
      </div>
   </details>

   <div class="flex items-center justify-between">
      <Button variant="outline" onclick={onBack} type="button">
         {m.common_previous()}
      </Button>

      <div class="flex items-center gap-2">
         <Button variant="outline" onclick={onSkip} type="button">
            {m.common_skip()}
         </Button>
         <Button type="submit" disabled={submitting}>
            {#if submitting}
               {m.common_loading()}
            {:else}
               {m.common_next()}
            {/if}
         </Button>
      </div>
   </div>
</form>
