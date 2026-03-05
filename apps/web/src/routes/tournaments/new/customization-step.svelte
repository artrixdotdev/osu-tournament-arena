<script lang="ts">
   import { m } from "$i18n/messages";
   import { client } from "$lib/orpc";
   import { toast } from "svelte-sonner";
   import { defaults, superForm } from "sveltekit-superforms";
   import { zod4, zod4Client } from "sveltekit-superforms/adapters";
   import { z } from "zod/v4";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as Form from "@ota/ui/components/form/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import { Textarea } from "@ota/ui/components/textarea/index.ts";

   const hslColorSchema = z
      .string()
      .trim()
      .regex(
         /^\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/,
         m.tournamentCreate_errors_invalidThemeColor(),
      );

   const customizationSchema = z.object({
      body: z.string(),
      fontFamily: z.string(),
      background: z.string().trim().refine((value) => !value || hslColorSchema.safeParse(value).success, m.tournamentCreate_errors_invalidThemeColor()),
      foreground: z.string().trim().refine((value) => !value || hslColorSchema.safeParse(value).success, m.tournamentCreate_errors_invalidThemeColor()),
      primary: z.string().trim().refine((value) => !value || hslColorSchema.safeParse(value).success, m.tournamentCreate_errors_invalidThemeColor()),
      primaryForeground: z.string().trim().refine((value) => !value || hslColorSchema.safeParse(value).success, m.tournamentCreate_errors_invalidThemeColor()),
      accent: z.string().trim().refine((value) => !value || hslColorSchema.safeParse(value).success, m.tournamentCreate_errors_invalidThemeColor()),
      accentForeground: z.string().trim().refine((value) => !value || hslColorSchema.safeParse(value).success, m.tournamentCreate_errors_invalidThemeColor()),
   });

   const GOOGLE_FONT_OPTIONS = [
      "Inter",
      "Manrope",
      "Poppins",
      "Space Grotesk",
      "Merriweather",
      "Bebas Neue",
      "IBM Plex Sans",
      "Roboto Slab",
      "Archivo",
      "Nunito Sans",
   ] as const;

   interface Props {
      tournamentId: string;
      submitting?: boolean;
      onBack: () => void;
      onSkip: () => void;
      onSubmit: (payload: {
         body?: string;
         fontFamily?: string | null;
         themeColors?: {
            background?: string;
            foreground?: string;
            primary?: string;
            primaryForeground?: string;
            accent?: string;
            accentForeground?: string;
         } | null;
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
            background: "",
            foreground: "",
            primary: "",
            primaryForeground: "",
            accent: "",
            accentForeground: "",
         },
         zod4(customizationSchema),
      ),
      {
         validators: zod4Client(customizationSchema),
         SPA: true,
      },
   );

   const { form: formData, validateForm } = customizationForm;

   let mediaUploading = $state(false);
   const mediaInputId = "tournament-media-upload-input";

   function appendMarkdown(snippet: string) {
      const body = $formData.body.trim();
      $formData.body = body ? `${body}\n\n${snippet}` : snippet;
   }

   async function handleMediaUpload(event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file || mediaUploading) {
         return;
      }

      if (file.size > 4 * 1024 * 1024) {
         toast.error(m.tournamentCreate_errors_mediaTooLarge());
         input.value = "";
         return;
      }

      mediaUploading = true;
      try {
         const upload = await client.tournament.createContentMediaUpload({
            id: tournamentId,
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            sizeBytes: file.size,
         });

         const response = await fetch(upload.uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
               "Content-Type": file.type,
            },
         });

         if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}`);
         }

         if (file.type.startsWith("image/")) {
            appendMarkdown(`![${file.name}](${upload.publicUrl})`);
         } else if (file.type.startsWith("video/")) {
            appendMarkdown(`<video controls src="${upload.publicUrl}"></video>`);
         } else if (file.type.startsWith("audio/")) {
            appendMarkdown(`<audio controls src="${upload.publicUrl}"></audio>`);
         } else {
            appendMarkdown(`[${file.name}](${upload.publicUrl})`);
         }

         toast.success(m.tournamentCreate_success_mediaUploaded());
      } catch (error) {
         console.error("Failed to upload tournament media:", error);
         toast.error(m.tournamentCreate_errors_mediaUploadFailed());
      } finally {
         mediaUploading = false;
         input.value = "";
      }
   }

   async function handleSubmit() {
      const validation = await validateForm({ update: true });
      if (!validation.valid) {
         return;
      }

      const themeColors = {
         background: validation.data.background || undefined,
         foreground: validation.data.foreground || undefined,
         primary: validation.data.primary || undefined,
         primaryForeground: validation.data.primaryForeground || undefined,
         accent: validation.data.accent || undefined,
         accentForeground: validation.data.accentForeground || undefined,
      };

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
   <Form.Field form={customizationForm} name="fontFamily">
      <Form.Control>
         <div class="space-y-2">
            <Form.Label>{m.tournamentCreate_fields_fontFamily()}</Form.Label>
            <select
               class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
               bind:value={$formData.fontFamily}
            >
               <option value="">{m.common_optional()}</option>
               {#each GOOGLE_FONT_OPTIONS as font (font)}
                  <option value={font}>{font}</option>
               {/each}
            </select>
            <Form.FieldErrors />
         </div>
      </Form.Control>
   </Form.Field>

   <Form.Field form={customizationForm} name="body">
      <Form.Control>
         <div class="space-y-2">
            <Form.Label>{m.tournamentCreate_fields_pageBody()}</Form.Label>
            <Textarea
               rows={12}
               placeholder={m.tournamentCreate_help_pageBody()}
               bind:value={$formData.body}
            />
            <p class="text-muted-foreground text-xs">
               {m.tournamentCreate_hints_markdownMedia()}
            </p>
            <Form.FieldErrors />
         </div>
      </Form.Control>
   </Form.Field>

   <div class="space-y-2">
      <label class="text-sm font-medium" for={mediaInputId}>
         {m.tournamentCreate_fields_mediaUpload()}
      </label>
      <Input
         id={mediaInputId}
         type="file"
         accept="image/*,video/*,audio/*"
         onchange={handleMediaUpload}
      />
      <p class="text-muted-foreground text-xs">
         {m.tournamentCreate_help_mediaUpload()}
      </p>
   </div>

   <div class="grid gap-4 sm:grid-cols-2">
      <Form.Field form={customizationForm} name="background">
         <Form.Control>
            <div class="space-y-2">
               <Form.Label>{m.tournamentCreate_fields_themeBackground()}</Form.Label>
               <Input placeholder="210 40% 98%" bind:value={$formData.background} />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={customizationForm} name="foreground">
         <Form.Control>
            <div class="space-y-2">
               <Form.Label>{m.tournamentCreate_fields_themeForeground()}</Form.Label>
               <Input placeholder="222.2 47.4% 11.2%" bind:value={$formData.foreground} />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={customizationForm} name="primary">
         <Form.Control>
            <div class="space-y-2">
               <Form.Label>{m.tournamentCreate_fields_themePrimary()}</Form.Label>
               <Input placeholder="221.2 83.2% 53.3%" bind:value={$formData.primary} />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={customizationForm} name="primaryForeground">
         <Form.Control>
            <div class="space-y-2">
               <Form.Label>{m.tournamentCreate_fields_themePrimaryForeground()}</Form.Label>
               <Input placeholder="210 40% 98%" bind:value={$formData.primaryForeground} />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={customizationForm} name="accent">
         <Form.Control>
            <div class="space-y-2">
               <Form.Label>{m.tournamentCreate_fields_themeAccent()}</Form.Label>
               <Input placeholder="210 40% 96.1%" bind:value={$formData.accent} />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>

      <Form.Field form={customizationForm} name="accentForeground">
         <Form.Control>
            <div class="space-y-2">
               <Form.Label>{m.tournamentCreate_fields_themeAccentForeground()}</Form.Label>
               <Input placeholder="222.2 47.4% 11.2%" bind:value={$formData.accentForeground} />
               <Form.FieldErrors />
            </div>
         </Form.Control>
      </Form.Field>
   </div>

   <div class="flex items-center justify-between">
      <Button variant="outline" onclick={onBack} type="button">
         {m.common_previous()}
      </Button>

      <div class="flex items-center gap-2">
         <Button variant="outline" onclick={onSkip} type="button">
            {m.common_skip()}
         </Button>
         <Button type="submit" disabled={submitting || mediaUploading}>
            {#if submitting || mediaUploading}
               {m.common_loading()}
            {:else}
               {m.common_next()}
            {/if}
         </Button>
      </div>
   </div>
</form>
