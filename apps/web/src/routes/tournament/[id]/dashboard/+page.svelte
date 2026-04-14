<script lang="ts">
   import { untrack } from "svelte";
   import { goto } from "$app/navigation";
   import { resolve } from "$app/paths";
   import { m } from "$i18n/messages";
   import { client } from "$lib/orpc";
   import {
      parseTournamentTheme,
      stringifyTournamentTheme,
      TOURNAMENT_FONT_OPTIONS,
   } from "$lib/tournament-page";
   import { toast } from "svelte-sonner";

   import { StaffRole } from "@ota/db/schema";
   import { uploadFile } from "@ota/storage/client";
   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Button } from "@ota/ui/components/button/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import { MarkdownEditor } from "@ota/ui/components/markdown-editor/index.ts";
   import { Textarea } from "@ota/ui/components/textarea/index.ts";

   import type { PageProps } from "./$types";

   const { data }: PageProps = $props();
   const initialContent = untrack(() => data.dashboard.content);

   let body = $state(initialContent?.body ?? "");
   let fontFamily = $state(initialContent?.fontFamily ?? "");
   let themeJson = $state(stringifyTournamentTheme(initialContent?.theme));
   let saving = $state(false);

   const roleSet = $derived(new Set(data.dashboard.roles));
   const canCustomize = $derived(data.dashboard.permissions.canCustomizePage);
   const showOperationsCard = $derived(
      roleSet.has(StaffRole.COMMENTATOR) ||
         roleSet.has(StaffRole.REFEREE) ||
         roleSet.has(StaffRole.ADMIN) ||
         roleSet.has(StaffRole.HOST),
   );
   const showEligibilityCard = $derived(
      roleSet.has(StaffRole.POOLER) ||
         roleSet.has(StaffRole.PLAYTESTER) ||
         roleSet.has(StaffRole.ADMIN) ||
         roleSet.has(StaffRole.HOST),
   );

   const customizationCoverage = $derived(
      data.dashboard.metrics.customizationCoverage.map((item) => ({
         ...item,
         label:
            item.id === "body"
               ? m.tournamentDashboard_coverage_body()
               : item.id === "theme"
                 ? m.tournamentDashboard_coverage_theme()
                 : m.tournamentDashboard_coverage_font(),
      })),
   );

   function roleLabel(role: StaffRole) {
      switch (role) {
         case StaffRole.COMMENTATOR:
            return m.tournamentDashboard_role_COMMENTATOR();
         case StaffRole.REFEREE:
            return m.tournamentDashboard_role_REFEREE();
         case StaffRole.PLAYTESTER:
            return m.tournamentDashboard_role_PLAYTESTER();
         case StaffRole.POOLER:
            return m.tournamentDashboard_role_POOLER();
         case StaffRole.ADMIN:
            return m.tournamentDashboard_role_ADMIN();
         case StaffRole.HOST:
            return m.tournamentDashboard_role_HOST();
      }
   }

   async function handleSave() {
      if (!canCustomize) {
         return;
      }

      saving = true;

      try {
         const theme = parseTournamentTheme(themeJson);

         await client.tournament.updateContent({
            id: data.dashboard.tournament.id,
            body,
            fontFamily: fontFamily || null,
            theme,
         });

         toast.success(m.tournamentDashboard_success_saved());
      } catch (cause) {
         console.error("Failed to save tournament page settings:", cause);

         if (cause instanceof SyntaxError) {
            toast.error(m.tournamentDashboard_error_invalidThemeJson());
         } else {
            toast.error(m.tournamentDashboard_error_saveFailed());
         }
      } finally {
         saving = false;
      }
   }

   async function handlePreviewRequest(nextBody: string) {
      const preview = await client.tournament.previewMarkdown({
         id: data.dashboard.tournament.id,
         body: nextBody,
      });

      return preview.html;
   }

   async function handleUploadFiles({ files }: { files: File[] }) {
      try {
         const snippets = await Promise.all(
            files.map(async (file) => {
               const upload = await client.tournament.createContentImageUpload({
                  id: data.dashboard.tournament.id,
                  fileName: file.name,
                  contentType: file.type,
                  sizeBytes: file.size,
               });
               const response = await uploadFile(upload.uploadUrl, file);

               if (!response.ok) {
                  throw new Error(`Upload failed for ${file.name}`);
               }

               return upload.markdown;
            }),
         );

         return { snippets };
      } catch (cause) {
         console.error("Failed to upload tournament page images:", cause);
         toast.error(m.tournamentDashboard_error_uploadFailed());
         throw cause;
      }
   }
</script>

<svelte:head>
   <title>
      {m.tournamentDashboard_pageTitle({
         name: data.dashboard.tournament.name,
      })}
   </title>
</svelte:head>

<div
   class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
>
   <section
      class="dashboard-hero overflow-hidden rounded-[2rem] border p-6 sm:p-8"
   >
      <div
         class="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.9fr)]"
      >
         <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
               {#each data.dashboard.roles as role (role)}
                  <Badge variant="secondary">{roleLabel(role)}</Badge>
               {/each}
            </div>

            <div class="space-y-3">
               <h1
                  class="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl"
               >
                  {m.tournamentDashboard_title()}
               </h1>
               <p class="text-muted-foreground max-w-3xl text-base leading-7">
                  {m.tournamentDashboard_description()}
               </p>
            </div>
         </div>

         <div class="bg-background/80 rounded-[1.5rem] border p-5">
            <p
               class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
            >
               {m.tournamentDashboard_roles_title()}
            </p>
            <p class="text-muted-foreground mt-2 text-sm leading-6">
               {m.tournamentDashboard_roles_description()}
            </p>

            <div class="mt-5 space-y-3">
               <label class="text-sm font-medium" for="public-page-link">
                  {m.tournamentDashboard_previewLink()}
               </label>
               <Input
                  id="public-page-link"
                  value={`/tournament/${data.dashboard.tournament.id}`}
                  readonly
               />
               <Button
                  variant="outline"
                  class="w-full"
                  onclick={async () => {
                     await goto(
                        resolve(`/tournament/${data.dashboard.tournament.id}`),
                     );
                  }}
               >
                  {m.tournamentDashboard_openPage()}
               </Button>
               <p class="text-muted-foreground text-xs">
                  {m.tournamentDashboard_openPageDescription()}
               </p>
            </div>
         </div>
      </div>
   </section>

   <section class="grid gap-4 sm:grid-cols-3">
      <article class="dashboard-card p-5">
         <p class="text-muted-foreground text-sm">
            {m.tournamentDashboard_metric_players()}
         </p>
         <p class="mt-3 text-4xl font-semibold">
            {data.dashboard.metrics.playerCount}
         </p>
      </article>
      <article class="dashboard-card p-5">
         <p class="text-muted-foreground text-sm">
            {m.tournamentDashboard_metric_teams()}
         </p>
         <p class="mt-3 text-4xl font-semibold">
            {data.dashboard.metrics.teamCount}
         </p>
      </article>
      <article class="dashboard-card p-5">
         <p class="text-muted-foreground text-sm">
            {m.tournamentDashboard_metric_staff()}
         </p>
         <p class="mt-3 text-4xl font-semibold">
            {data.dashboard.metrics.staffCount}
         </p>
      </article>
   </section>

   <section
      class="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)]"
   >
      {#if canCustomize}
         <article class="dashboard-card space-y-5 p-6">
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
               >
                  {m.tournamentDashboard_customization_title()}
               </p>
               <h2 class="text-2xl font-semibold tracking-[-0.03em]">
                  {m.tournamentDashboard_customization_title()}
               </h2>
               <p class="text-muted-foreground text-sm leading-6">
                  {m.tournamentDashboard_customization_description()}
               </p>
            </div>

            <div
               class="grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]"
            >
               <div class="space-y-2">
                  <label class="text-sm font-medium" for="font-family">
                     {m.tournamentDashboard_field_font()}
                  </label>
                  <select
                     id="font-family"
                     bind:value={fontFamily}
                     class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm outline-none"
                  >
                     <option value="">{m.locale_system()}</option>
                     {#each TOURNAMENT_FONT_OPTIONS as font (font)}
                        <option value={font}>{font}</option>
                     {/each}
                  </select>
               </div>

               <div class="space-y-2">
                  <label class="text-sm font-medium" for="theme-json">
                     {m.tournamentDashboard_field_themeJson()}
                  </label>
                  <Textarea id="theme-json" bind:value={themeJson} rows={8} />
                  <p class="text-muted-foreground text-xs">
                     {m.tournamentDashboard_field_themeJsonDescription()}
                  </p>
               </div>
            </div>

            <MarkdownEditor
               bind:value={body}
               placeholder={m.tournamentDashboard_markdownPlaceholder()}
               previewPlaceholder={m.tournamentDashboard_markdownPreviewEmpty()}
               writeLabel={m.common_write()}
               previewLabel={m.common_preview()}
               uploadLabel={m.tournamentDashboard_uploadImage()}
               uploadingLabel={m.tournamentDashboard_uploadingImage()}
               renderingLabel={m.tournamentDashboard_renderingPreview()}
               dropLabel={m.tournamentDashboard_dropImages()}
               emptyHint={m.tournamentDashboard_emptyHint()}
               onPreviewRequest={handlePreviewRequest}
               onUploadFiles={handleUploadFiles}
            />

            <div class="flex justify-end">
               <Button onclick={handleSave} disabled={saving}>
                  {saving
                     ? m.tournamentDashboard_savingChanges()
                     : m.tournamentDashboard_saveChanges()}
               </Button>
            </div>
         </article>
      {/if}

      <div class="grid gap-4">
         <article class="dashboard-card space-y-4 p-6">
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
               >
                  {m.tournamentDashboard_customizationCoverage_title()}
               </p>
               <h2 class="text-xl font-semibold tracking-[-0.03em]">
                  {m.tournamentDashboard_customizationCoverage_title()}
               </h2>
               <p class="text-muted-foreground text-sm leading-6">
                  {m.tournamentDashboard_customizationCoverage_description()}
               </p>
            </div>

            <div class="space-y-3">
               {#each customizationCoverage as item (item.id)}
                  <div class="space-y-2">
                     <div
                        class="flex items-center justify-between gap-3 text-sm"
                     >
                        <span>{item.label}</span>
                        <span class="text-muted-foreground">
                           {item.value === 1 ? "100%" : "0%"}
                        </span>
                     </div>
                     <div class="bg-muted h-2 rounded-full">
                        <div
                           class="bg-primary h-2 rounded-full transition-[width]"
                           style={`width: ${item.value === 1 ? 100 : 18}%`}
                        ></div>
                     </div>
                  </div>
               {/each}
            </div>
         </article>

         {#if showOperationsCard}
            <article class="dashboard-card space-y-4 p-6">
               <div class="space-y-2">
                  <p
                     class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
                  >
                     {m.tournamentDashboard_operations_title()}
                  </p>
                  <h2 class="text-xl font-semibold tracking-[-0.03em]">
                     {m.tournamentDashboard_operations_title()}
                  </h2>
                  <p class="text-muted-foreground text-sm leading-6">
                     {m.tournamentDashboard_operations_description()}
                  </p>
               </div>

               <div class="space-y-3">
                  {#each data.dashboard.metrics.staffRoleCounts as item (item.role)}
                     <div class="space-y-2">
                        <div
                           class="flex items-center justify-between gap-3 text-sm"
                        >
                           <span>{roleLabel(item.role as StaffRole)}</span>
                           <span class="text-muted-foreground"
                              >{item.total}</span
                           >
                        </div>
                        <div class="bg-muted h-2 rounded-full">
                           <div
                              class="bg-accent h-2 rounded-full transition-[width]"
                              style={`width: ${Math.min(100, item.total * 18)}%`}
                           ></div>
                        </div>
                     </div>
                  {/each}
               </div>
            </article>
         {/if}

         {#if showEligibilityCard}
            <article class="dashboard-card space-y-4 p-6">
               <div class="space-y-2">
                  <p
                     class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
                  >
                     {m.tournamentDashboard_eligibility_title()}
                  </p>
                  <h2 class="text-xl font-semibold tracking-[-0.03em]">
                     {m.tournamentDashboard_eligibility_title()}
                  </h2>
                  <p class="text-muted-foreground text-sm leading-6">
                     {m.tournamentDashboard_eligibility_description()}
                  </p>
               </div>

               <dl class="grid gap-3">
                  <div class="bg-muted/45 rounded-2xl border px-4 py-3">
                     <dt class="text-muted-foreground text-xs uppercase">
                        {m.common_minimumRank()}
                     </dt>
                     <dd class="mt-1 font-semibold">
                        {data.dashboard.screeningRequirements?.minimumRank ??
                           m.tournamentDashboard_screeningAny()}
                     </dd>
                  </div>
                  <div class="bg-muted/45 rounded-2xl border px-4 py-3">
                     <dt class="text-muted-foreground text-xs uppercase">
                        {m.common_maximumRank()}
                     </dt>
                     <dd class="mt-1 font-semibold">
                        {data.dashboard.screeningRequirements?.maximumRank ??
                           m.tournamentDashboard_screeningAny()}
                     </dd>
                  </div>
                  <div class="bg-muted/45 rounded-2xl border px-4 py-3">
                     <dt class="text-muted-foreground text-xs uppercase">
                        {m.common_bws()}
                     </dt>
                     <dd class="mt-1 font-semibold">
                        {data.dashboard.screeningRequirements?.useBws
                           ? m.common_enabled()
                           : m.tournamentDashboard_screeningUnset()}
                     </dd>
                  </div>
               </dl>
            </article>
         {/if}
      </div>
   </section>
</div>

<style>
   .dashboard-hero {
      background:
         linear-gradient(135deg, hsl(var(--primary) / 0.12), transparent 44%),
         linear-gradient(180deg, hsl(var(--card) / 0.95), hsl(var(--card)));
      box-shadow:
         0 1px 0 rgb(0 0 0 / 0.02),
         0 18px 40px rgb(24 32 52 / 0.08);
   }

   .dashboard-card {
      border: 1px solid hsl(var(--border) / 0.7);
      border-radius: 1.5rem;
      background: hsl(var(--card));
      box-shadow: 0 12px 28px rgb(15 23 42 / 0.05);
   }
</style>
