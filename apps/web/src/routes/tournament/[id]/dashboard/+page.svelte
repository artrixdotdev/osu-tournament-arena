<script lang="ts">
   import { untrack } from "svelte";
   import { goto } from "$app/navigation";
   import { m } from "$i18n/messages";
   import TournamentThemeFields from "$lib/components/tournament-theme-fields.svelte";
   import { client } from "$lib/orpc";
   import { TOURNAMENT_FONT_OPTIONS } from "$lib/tournament-page";
   import { toast } from "svelte-sonner";

   import type {
      TournamentPageTheme,
      TournamentThemeTokens,
   } from "@ota/db/schema";
   import { StaffRole } from "@ota/db/schema";
   import { uploadFile } from "@ota/storage/client";
   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Button } from "@ota/ui/components/button/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import { MarkdownEditor } from "@ota/ui/components/markdown-editor/index.ts";
   import { Separator } from "@ota/ui/components/separator/index.ts";

   import type { PageProps } from "./$types";

   const { data }: PageProps = $props();
   const initialContent = untrack(() => data.dashboard.content);

   let body = $state(initialContent?.body ?? "");
   let fontFamily = $state(initialContent?.fontFamily ?? "");
   let radius = $state(initialContent?.theme?.radius?.toString() ?? "");
   let lightTheme = $state<Partial<TournamentThemeTokens>>(
      initialContent?.theme?.light ?? {},
   );
   let darkTheme = $state<Partial<TournamentThemeTokens>>(
      initialContent?.theme?.dark ?? {},
   );
   const initialActiveTab = untrack(() =>
      data.dashboard.permissions.canCustomizePage ? "page" : "overview",
   );
   let activeTab = $state<"overview" | "page">(initialActiveTab);
   let themeMode = $state<"light" | "dark">("light");
   let saving = $state(false);

   const roleSet = $derived(new Set(data.dashboard.roles));
   const canCustomize = $derived(data.dashboard.permissions.canCustomizePage);
   const previewPath = $derived(
      `/tournament/${data.dashboard.tournament.id}` as `/tournament/${string}`,
   );
   const visibilityLabel = $derived.by(() => {
      if (data.dashboard.tournament.isArchived) {
         return m.common_archived();
      }

      return data.dashboard.tournament.isPublic
         ? m.common_public()
         : m.common_private();
   });
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
         percent: item.value === 1 ? 100 : 0,
         label:
            item.id === "body"
               ? m.tournamentDashboard_coverage_body()
               : item.id === "theme"
                 ? m.tournamentDashboard_coverage_theme()
                 : m.tournamentDashboard_coverage_font(),
      })),
   );
   const statCards = $derived([
      {
         id: "players",
         label: m.tournamentDashboard_metric_players(),
         value: data.dashboard.metrics.playerCount,
      },
      {
         id: "teams",
         label: m.tournamentDashboard_metric_teams(),
         value: data.dashboard.metrics.teamCount,
      },
      {
         id: "staff",
         label: m.tournamentDashboard_metric_staff(),
         value: data.dashboard.metrics.staffCount,
      },
   ]);

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

   function buildThemePayload(): TournamentPageTheme | null {
      const nextRadius = Number(radius);
      const normalizedRadius =
         radius.trim() && Number.isFinite(nextRadius) ? nextRadius : null;
      const normalizedLight =
         Object.keys(lightTheme).length > 0 ? lightTheme : null;
      const normalizedDark =
         Object.keys(darkTheme).length > 0 ? darkTheme : null;

      if (
         normalizedRadius === null &&
         normalizedLight === null &&
         normalizedDark === null
      ) {
         return null;
      }

      return {
         radius: normalizedRadius,
         light: normalizedLight,
         dark: normalizedDark,
      };
   }

   async function handleSave() {
      if (!canCustomize) {
         return;
      }

      saving = true;

      try {
         await client.tournament.updateContent({
            id: data.dashboard.tournament.id,
            body,
            fontFamily: fontFamily || null,
            theme: buildThemePayload(),
         });

         toast.success(m.tournamentDashboard_success_saved());
      } catch (cause) {
         console.error("Failed to save tournament page settings:", cause);
         toast.error(m.tournamentDashboard_error_saveFailed());
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

<div class="bg-background min-h-full">
   <div
      class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
   >
      <section
         class="bg-background overflow-hidden rounded-3xl border shadow-sm"
      >
         <div
            class="bg-card/60 flex flex-wrap justify-between gap-4 border-b px-6 py-6"
         >
            <div class="space-y-3">
               <p
                  class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
               >
                  {m.navigation_tournaments()} / {data.dashboard.tournament
                     .name}
               </p>
               <div class="flex flex-wrap items-center gap-3">
                  <h1
                     class="text-3xl font-semibold tracking-[-0.05em] sm:text-5xl"
                  >
                     {m.tournamentDashboard_title()}
                  </h1>
                  <Badge variant="secondary">{visibilityLabel}</Badge>
                  {#each data.dashboard.roles as role (role)}
                     <Badge variant="outline">{roleLabel(role)}</Badge>
                  {/each}
               </div>
               <p
                  class="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base"
               >
                  {m.tournamentDashboard_description()}
               </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
               <Button
                  variant="outline"
                  onclick={async () => {
                     await goto(previewPath);
                  }}
               >
                  {m.tournamentDashboard_openPage()}
               </Button>
               {#if canCustomize}
                  <Button onclick={handleSave} disabled={saving}>
                     {saving
                        ? m.tournamentDashboard_savingChanges()
                        : m.tournamentDashboard_saveChanges()}
                  </Button>
               {/if}
            </div>
         </div>

         <div class="flex gap-2 border-b px-5 pt-3">
            <Button
               variant={activeTab === "overview" ? "secondary" : "ghost"}
               class="rounded-t-xl rounded-b-none"
               onclick={() => {
                  activeTab = "overview";
               }}
            >
               {m.tournamentDashboard_metrics_title()}
            </Button>

            {#if canCustomize}
               <Button
                  variant={activeTab === "page" ? "secondary" : "ghost"}
                  class="rounded-t-xl rounded-b-none"
                  onclick={() => {
                     activeTab = "page";
                  }}
               >
                  {m.tournamentDashboard_customization_title()}
               </Button>
            {/if}
         </div>

         {#if activeTab === "overview"}
            <div class="p-5">
               <section
                  class="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.9fr)]"
               >
                  <div class="grid gap-4">
                     <div class="grid gap-4 md:grid-cols-3">
                        {#each statCards as item (item.id)}
                           <article
                              class="bg-card rounded-2xl border px-5 py-5 shadow-sm"
                           >
                              <p
                                 class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                              >
                                 {item.label}
                              </p>
                              <p
                                 class="mt-3 text-4xl font-semibold tracking-[-0.05em]"
                              >
                                 {item.value}
                              </p>
                           </article>
                        {/each}
                     </div>

                     {#if showOperationsCard}
                        <article
                           class="bg-card space-y-5 rounded-2xl border p-6 shadow-sm"
                        >
                           <div class="space-y-2">
                              <p
                                 class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                              >
                                 {m.tournamentDashboard_operations_title()}
                              </p>
                              <h2
                                 class="text-lg font-semibold tracking-[-0.03em]"
                              >
                                 {m.tournamentDashboard_operations_title()}
                              </h2>
                              <p
                                 class="text-muted-foreground text-sm leading-6"
                              >
                                 {m.tournamentDashboard_operations_description()}
                              </p>
                           </div>

                           <div class="grid gap-3">
                              {#each data.dashboard.metrics.staffRoleCounts as item (item.role)}
                                 <div
                                    class="bg-muted/40 grid gap-2 rounded-2xl border px-4 py-3"
                                 >
                                    <div
                                       class="flex items-center justify-between gap-4"
                                    >
                                       <span class="font-medium"
                                          >{roleLabel(
                                             item.role as StaffRole,
                                          )}</span
                                       >
                                       <span
                                          class="text-muted-foreground text-sm"
                                          >{item.total}</span
                                       >
                                    </div>
                                    <div
                                       class="bg-muted h-2 overflow-hidden rounded-full"
                                    >
                                       <div
                                          class="bg-foreground h-full rounded-full"
                                          style={`width: ${Math.max(10, Math.min(100, item.total * 16))}%`}
                                       ></div>
                                    </div>
                                 </div>
                              {/each}
                           </div>
                        </article>
                     {/if}
                  </div>

                  <div class="grid gap-4">
                     <article
                        class="bg-card space-y-4 rounded-2xl border p-6 shadow-sm"
                     >
                        <div class="space-y-2">
                           <p
                              class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                           >
                              {m.tournamentDashboard_roles_title()}
                           </p>
                           <h2 class="text-lg font-semibold tracking-[-0.03em]">
                              {m.tournamentDashboard_roles_title()}
                           </h2>
                           <p class="text-muted-foreground text-sm leading-6">
                              {m.tournamentDashboard_roles_description()}
                           </p>
                        </div>

                        <div class="space-y-3">
                           <label
                              class="text-sm font-medium"
                              for="public-page-link"
                           >
                              {m.tournamentDashboard_previewLink()}
                           </label>
                           <Input
                              id="public-page-link"
                              value={previewPath}
                              readonly
                           />
                           <p class="text-muted-foreground text-xs">
                              {m.tournamentDashboard_openPageDescription()}
                           </p>
                        </div>
                     </article>

                     <article
                        class="bg-card space-y-4 rounded-2xl border p-6 shadow-sm"
                     >
                        <div class="space-y-2">
                           <p
                              class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                           >
                              {m.tournamentDashboard_customizationCoverage_title()}
                           </p>
                           <h2 class="text-lg font-semibold tracking-[-0.03em]">
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
                                    <span class="text-muted-foreground"
                                       >{item.percent}%</span
                                    >
                                 </div>
                                 <div
                                    class="bg-muted h-2 overflow-hidden rounded-full"
                                 >
                                    <div
                                       class="bg-foreground h-full rounded-full"
                                       style={`width: ${item.percent}%`}
                                    ></div>
                                 </div>
                              </div>
                           {/each}
                        </div>
                     </article>

                     {#if showEligibilityCard}
                        <article
                           class="bg-card space-y-4 rounded-2xl border p-6 shadow-sm"
                        >
                           <div class="space-y-2">
                              <p
                                 class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                              >
                                 {m.tournamentDashboard_eligibility_title()}
                              </p>
                              <h2
                                 class="text-lg font-semibold tracking-[-0.03em]"
                              >
                                 {m.tournamentDashboard_eligibility_title()}
                              </h2>
                              <p
                                 class="text-muted-foreground text-sm leading-6"
                              >
                                 {m.tournamentDashboard_eligibility_description()}
                              </p>
                           </div>

                           <dl class="grid gap-3">
                              <div
                                 class="bg-muted/40 grid gap-2 rounded-2xl border px-4 py-3"
                              >
                                 <dt
                                    class="text-muted-foreground text-xs uppercase"
                                 >
                                    {m.common_minimumRank()}
                                 </dt>
                                 <dd class="mt-1 font-semibold">
                                    {data.dashboard.screeningRequirements
                                       ?.minimumRank ??
                                       m.tournamentDashboard_screeningAny()}
                                 </dd>
                              </div>
                              <div
                                 class="bg-muted/40 grid gap-2 rounded-2xl border px-4 py-3"
                              >
                                 <dt
                                    class="text-muted-foreground text-xs uppercase"
                                 >
                                    {m.common_maximumRank()}
                                 </dt>
                                 <dd class="mt-1 font-semibold">
                                    {data.dashboard.screeningRequirements
                                       ?.maximumRank ??
                                       m.tournamentDashboard_screeningAny()}
                                 </dd>
                              </div>
                              <div
                                 class="bg-muted/40 grid gap-2 rounded-2xl border px-4 py-3"
                              >
                                 <dt
                                    class="text-muted-foreground text-xs uppercase"
                                 >
                                    {m.common_bws()}
                                 </dt>
                                 <dd class="mt-1 font-semibold">
                                    {data.dashboard.screeningRequirements
                                       ?.useBws
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
         {:else}
            <div class="p-5">
               <section
                  class="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(24rem,0.8fr)]"
               >
                  <article
                     class="bg-card overflow-hidden rounded-2xl border shadow-sm"
                  >
                     <div class="px-5 py-5">
                        <div class="space-y-2">
                           <p
                              class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                           >
                              {m.tournamentDashboard_customization_title()}
                           </p>
                           <h2 class="text-lg font-semibold tracking-[-0.03em]">
                              {m.tournamentDashboard_customization_title()}
                           </h2>
                           <p class="text-muted-foreground text-sm leading-6">
                              {m.tournamentDashboard_customization_description()}
                           </p>
                        </div>
                     </div>

                     <Separator />

                     <div class="p-4 sm:p-5">
                        <MarkdownEditor
                           bind:value={body}
                           class="[--tw-prose-body:hsl(var(--foreground)_/_0.9)] [--tw-prose-bold:hsl(var(--foreground))] [--tw-prose-bullets:hsl(var(--muted-foreground))] [--tw-prose-code:hsl(var(--foreground))] [--tw-prose-headings:hsl(var(--foreground))] [--tw-prose-hr:hsl(var(--border))] [--tw-prose-links:hsl(var(--foreground))] [--tw-prose-pre-bg:hsl(var(--muted))] [--tw-prose-pre-code:hsl(var(--foreground))] [--tw-prose-quote-borders:hsl(var(--border))] [--tw-prose-quotes:hsl(var(--foreground))] [--tw-prose-td-borders:hsl(var(--border))] [--tw-prose-th-borders:hsl(var(--border))]"
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
                     </div>
                  </article>

                  <div class="grid gap-4">
                     <article
                        class="bg-card space-y-4 rounded-2xl border p-6 shadow-sm"
                     >
                        <div class="space-y-2">
                           <p
                              class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                           >
                              {m.tournamentDashboard_previewLink()}
                           </p>
                           <h2 class="text-lg font-semibold tracking-[-0.03em]">
                              {data.dashboard.tournament.name}
                           </h2>
                        </div>

                        <div class="flex flex-wrap gap-2">
                           <Badge variant="secondary">{visibilityLabel}</Badge>
                           {#each data.dashboard.roles as role (role)}
                              <Badge variant="outline">{roleLabel(role)}</Badge>
                           {/each}
                        </div>

                        <Input value={previewPath} readonly />

                        <Button
                           variant="outline"
                           class="w-full"
                           onclick={async () => {
                              await goto(previewPath);
                           }}
                        >
                           {m.tournamentDashboard_openPage()}
                        </Button>
                     </article>

                     <article
                        class="bg-card space-y-5 rounded-2xl border p-6 shadow-sm"
                     >
                        <div class="space-y-2">
                           <p
                              class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                           >
                              {m.tournamentDashboard_field_font()}
                           </p>
                           <h2 class="text-lg font-semibold tracking-[-0.03em]">
                              {m.tournamentDashboard_field_font()}
                           </h2>
                        </div>

                        <div class="space-y-2">
                           <label class="text-sm font-medium" for="font-family">
                              {m.tournamentDashboard_field_font()}
                           </label>
                           <select
                              id="font-family"
                              bind:value={fontFamily}
                              class="bg-background h-11 w-full rounded-2xl border px-4 text-sm outline-none"
                           >
                              <option value="">{m.locale_system()}</option>
                              {#each TOURNAMENT_FONT_OPTIONS as font (font)}
                                 <option value={font}>{font}</option>
                              {/each}
                           </select>
                        </div>

                        <div class="space-y-2">
                           <label
                              class="text-sm font-medium"
                              for="theme-radius"
                           >
                              {m.common_radius()}
                           </label>
                           <Input
                              id="theme-radius"
                              bind:value={radius}
                              inputmode="decimal"
                              placeholder="1"
                           />
                        </div>

                        <div class="space-y-3">
                           <div class="bg-muted inline-flex rounded-xl p-1">
                              <Button
                                 variant={themeMode === "light"
                                    ? "secondary"
                                    : "ghost"}
                                 size="sm"
                                 onclick={() => {
                                    themeMode = "light";
                                 }}
                              >
                                 {m.common_light()}
                              </Button>
                              <Button
                                 variant={themeMode === "dark"
                                    ? "secondary"
                                    : "ghost"}
                                 size="sm"
                                 onclick={() => {
                                    themeMode = "dark";
                                 }}
                              >
                                 {m.common_dark()}
                              </Button>
                           </div>

                           {#if themeMode === "light"}
                              <TournamentThemeFields bind:value={lightTheme} />
                           {:else}
                              <TournamentThemeFields bind:value={darkTheme} />
                           {/if}
                        </div>
                     </article>

                     <article
                        class="bg-card space-y-4 rounded-2xl border p-6 shadow-sm"
                     >
                        <div class="space-y-2">
                           <p
                              class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
                           >
                              {m.tournamentDashboard_customizationCoverage_title()}
                           </p>
                           <h2 class="text-lg font-semibold tracking-[-0.03em]">
                              {m.tournamentDashboard_customizationCoverage_title()}
                           </h2>
                        </div>

                        <div class="space-y-3">
                           {#each customizationCoverage as item (item.id)}
                              <div class="space-y-2">
                                 <div
                                    class="flex items-center justify-between gap-3 text-sm"
                                 >
                                    <span>{item.label}</span>
                                    <span class="text-muted-foreground"
                                       >{item.percent}%</span
                                    >
                                 </div>
                                 <div
                                    class="bg-muted h-2 overflow-hidden rounded-full"
                                 >
                                    <div
                                       class="bg-foreground h-full rounded-full"
                                       style={`width: ${item.percent}%`}
                                    ></div>
                                 </div>
                              </div>
                           {/each}
                        </div>
                     </article>
                  </div>
               </section>
            </div>
         {/if}
      </section>
   </div>
</div>
