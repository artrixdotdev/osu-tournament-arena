<script lang="ts">
   import { m } from "$i18n/messages";
   import { client } from "$lib/orpc";
   import { toast } from "svelte-sonner";

   import { Button } from "@ota/ui/components/button/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import { Textarea } from "@ota/ui/components/textarea/index.ts";

   import type { PageData } from "./$types";

   let { data }: { data: PageData } = $props();

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

   const THEME_KEYS = [
      "background",
      "foreground",
      "card",
      "cardForeground",
      "primary",
      "primaryForeground",
      "secondary",
      "secondaryForeground",
      "muted",
      "mutedForeground",
      "accent",
      "accentForeground",
      "border",
      "input",
      "ring",
   ] as const;

   let editing = $state(false);
   let saving = $state(false);
   let uploading = $state(false);

   const initialBody = data.content.body;
   const initialRenderedBody = data.content.renderedBody;
   const initialFontFamily = data.content.fontFamily ?? "";
   const initialLogo = data.tournament.logo ?? "";
   const initialThemeColors = {
      ...(data.content.themeColors ?? {}),
   };

   let body = $state(initialBody);
   let renderedBody = $state(initialRenderedBody);
   let fontFamily = $state(initialFontFamily);
   let logo = $state(initialLogo);
   let themeColors = $state<Record<string, string>>(initialThemeColors);

   let bodyDraft = $state(initialBody);
   let fontFamilyDraft = $state(initialFontFamily);
   let logoDraft = $state(initialLogo);
   let themeDraft = $state<Record<string, string>>(initialThemeColors);

   const mediaInputId = "tournament-page-media-upload";

   const activeFont = $derived(editing ? fontFamilyDraft : fontFamily);
   const activeTheme = $derived(editing ? themeDraft : themeColors);
   const activeLogo = $derived(editing ? logoDraft : logo);

   const fontHref = $derived.by(() => {
      if (!activeFont) {
         return null;
      }

      const family = activeFont.trim();
      if (!family) {
         return null;
      }

      return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;
   });

   const scopeStyle = $derived.by(() => {
      const styles: string[] = [];

      for (const [key, value] of Object.entries(activeTheme)) {
         const token = value?.trim();
         if (!token) {
            continue;
         }
         styles.push(`--t-${key}:${token};`);
      }

      if (activeFont?.trim()) {
         const escapedFont = activeFont.trim().replace(/'/g, "\\'");
         styles.push(`--t-font:'${escapedFont}', sans-serif;`);
      }

      return styles.join(" ");
   });

   const tournamentInitials = $derived.by(() => {
      const acronym = data.tournament.acronym?.trim();
      if (acronym) {
         return acronym.slice(0, 2).toUpperCase();
      }

      return data.tournament.name
         .split(/\s+/)
         .filter(Boolean)
         .slice(0, 2)
         .map((part) => part[0]?.toUpperCase() ?? "")
         .join("");
   });

   function startEditing() {
      bodyDraft = body;
      fontFamilyDraft = fontFamily;
      logoDraft = logo;
      themeDraft = { ...themeColors };
      editing = true;
   }

   function cancelEditing() {
      editing = false;
   }

   function normalizeThemeInput(input: Record<string, string>) {
      const normalized: Record<string, string> = {};

      for (const key of THEME_KEYS) {
         const value = input[key]?.trim();
         if (value) {
            normalized[key] = value;
         }
      }

      return normalized;
   }

   async function savePage() {
      if (saving) {
         return;
      }

      saving = true;

      try {
         const normalizedTheme = normalizeThemeInput(themeDraft);

         const [contentResult, detailsResult] = await Promise.all([
            client.tournament.updateContent({
               id: data.tournament.id,
               body: bodyDraft,
               fontFamily: fontFamilyDraft.trim() || null,
               themeColors:
                  Object.keys(normalizedTheme).length > 0 ? normalizedTheme : null,
            }),
            client.tournament.updateDetails({
               id: data.tournament.id,
               logo: logoDraft.trim() || null,
            }),
         ]);

         if (!contentResult.updated || !detailsResult.updated) {
            throw new Error("Update failed");
         }

         body = contentResult.content.body;
         renderedBody = contentResult.content.renderedBody;
         fontFamily = contentResult.content.fontFamily ?? "";
         themeColors = {
            ...((contentResult.content.themeColors as Record<string, string> | null) ?? {}),
         };
         logo = detailsResult.tournament.logo ?? "";
         editing = false;
         toast.success("Tournament page updated");
      } catch (error) {
         console.error("Failed to update tournament page:", error);
         toast.error("Failed to update tournament page");
      } finally {
         saving = false;
      }
   }

   function appendMarkdown(snippet: string) {
      const trimmed = bodyDraft.trim();
      bodyDraft = trimmed ? `${trimmed}\n\n${snippet}` : snippet;
   }

   async function handleMediaUpload(event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file || uploading) {
         return;
      }

      if (file.size > 4 * 1024 * 1024) {
         toast.error("File must be 4 MB or smaller");
         input.value = "";
         return;
      }

      uploading = true;
      try {
         const upload = await client.tournament.createContentMediaUpload({
            id: data.tournament.id,
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

         toast.success("Media uploaded");
      } catch (error) {
         console.error("Failed to upload media:", error);
         toast.error("Failed to upload media");
      } finally {
         uploading = false;
         input.value = "";
      }
   }
</script>

<svelte:head>
   <title>{data.tournament.name}</title>
   {#if fontHref}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
      <link href={fontHref} rel="stylesheet" />
   {/if}
</svelte:head>

<div class="mx-auto w-full max-w-5xl p-6">
   <div class="mb-6 flex items-start justify-between gap-4">
      <div class="space-y-2">
         <h1 class="text-3xl font-bold">{data.tournament.name}</h1>
         {#if data.tournament.description}
            <p class="text-muted-foreground">{data.tournament.description}</p>
         {/if}
      </div>

      {#if data.canEdit && !editing}
         <Button onclick={startEditing}>{m.common_edit()}</Button>
      {/if}
   </div>

   <div class="tournament-page-scope rounded-xl border p-6" style={scopeStyle}>
      <div class="mb-6 flex items-center gap-4">
         {#if activeLogo?.trim()}
            <img
               src={activeLogo}
               alt={`${data.tournament.name} logo`}
               class="h-16 w-16 rounded-lg border object-cover"
            />
         {:else}
            <div class="tournament-logo-placeholder flex h-16 w-16 items-center justify-center rounded-lg border text-lg font-semibold">
               {tournamentInitials}
            </div>
         {/if}

         <div>
            <p class="text-sm uppercase tracking-wide">Tournament Page</p>
            <p class="text-muted-foreground text-sm">{data.tournament.id}</p>
         </div>
      </div>

      {#if editing}
         <div class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
               <div class="space-y-2">
                  <label class="text-sm font-medium" for="font-family">Google Font</label>
                  <select
                     id="font-family"
                     class="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                     bind:value={fontFamilyDraft}
                  >
                     <option value="">{m.common_optional()}</option>
                     {#each GOOGLE_FONT_OPTIONS as font (font)}
                        <option value={font}>{font}</option>
                     {/each}
                  </select>
               </div>

               <div class="space-y-2">
                  <label class="text-sm font-medium" for="logo-url">Logo URL</label>
                  <Input
                     id="logo-url"
                     type="url"
                     placeholder="https://cdn.example.com/logo.png"
                     bind:value={logoDraft}
                  />
               </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
               {#each THEME_KEYS as key (key)}
                  <div class="space-y-2">
                     <label class="text-sm font-medium" for={`theme-${key}`}>{key}</label>
                     <Input
                        id={`theme-${key}`}
                        placeholder="222.2 47.4% 11.2%"
                        bind:value={themeDraft[key]}
                     />
                  </div>
               {/each}
            </div>

            <div class="space-y-2">
               <label class="text-sm font-medium" for="body-markdown">Body Markdown</label>
               <Textarea id="body-markdown" rows={14} bind:value={bodyDraft} />
            </div>

            <div class="space-y-2">
               <label class="text-sm font-medium" for={mediaInputId}>Upload Media (max 4 MB)</label>
               <Input
                  id={mediaInputId}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onchange={handleMediaUpload}
               />
            </div>

            <div class="flex items-center justify-end gap-2">
               <Button variant="outline" onclick={cancelEditing} disabled={saving || uploading}>
                  {m.common_cancel()}
               </Button>
               <Button onclick={savePage} disabled={saving || uploading}>
                  {#if saving || uploading}
                     {m.common_loading()}
                  {:else}
                     {m.common_save()}
                  {/if}
               </Button>
            </div>
         </div>
      {:else}
         <article class="tournament-markdown prose-content">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html renderedBody}
         </article>
      {/if}
   </div>
</div>

<style>
   .tournament-page-scope {
      --t-background: var(--background);
      --t-foreground: var(--foreground);
      --t-card: var(--card);
      --t-cardForeground: var(--card-foreground);
      --t-primary: var(--primary);
      --t-primaryForeground: var(--primary-foreground);
      --t-secondary: var(--secondary);
      --t-secondaryForeground: var(--secondary-foreground);
      --t-muted: var(--muted);
      --t-mutedForeground: var(--muted-foreground);
      --t-accent: var(--accent);
      --t-accentForeground: var(--accent-foreground);
      --t-border: var(--border);
      --t-input: var(--input);
      --t-ring: var(--ring);
      background: hsl(var(--t-background));
      color: hsl(var(--t-foreground));
      border-color: hsl(var(--t-border));
      font-family: var(--t-font, inherit);
   }

   .tournament-logo-placeholder {
      background: hsl(var(--t-muted));
      color: hsl(var(--t-mutedForeground));
      border-color: hsl(var(--t-border));
   }

   .prose-content :global(a) {
      color: hsl(var(--t-primary));
      text-decoration: underline;
   }

   .prose-content :global(code) {
      background: hsl(var(--t-muted));
      padding: 0.12rem 0.3rem;
      border-radius: 0.25rem;
   }

   .prose-content :global(pre) {
      background: hsl(var(--t-muted));
      border: 1px solid hsl(var(--t-border));
      border-radius: 0.5rem;
      padding: 1rem;
      overflow-x: auto;
   }

   .prose-content :global(img),
   .prose-content :global(video),
   .prose-content :global(audio) {
      max-width: 100%;
      border-radius: 0.5rem;
      border: 1px solid hsl(var(--t-border));
      margin: 1rem 0;
   }

   .prose-content :global(table) {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid hsl(var(--t-border));
      margin: 1rem 0;
   }

   .prose-content :global(th),
   .prose-content :global(td) {
      border: 1px solid hsl(var(--t-border));
      padding: 0.5rem;
      text-align: left;
   }

   .prose-content :global(blockquote) {
      border-left: 3px solid hsl(var(--t-accent));
      padding-left: 1rem;
      color: hsl(var(--t-mutedForeground));
      margin: 1rem 0;
   }
</style>
